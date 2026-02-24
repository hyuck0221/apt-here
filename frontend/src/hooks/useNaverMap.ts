import { useEffect, useRef, useCallback } from 'react'
import type { GeoPosition } from './useGeolocation'
import type { AptInfo } from '../types/api'

interface UseNaverMapOptions {
  initialPosition: GeoPosition
  myPosition: GeoPosition | null           // 내 위치 빨간 점
  aptList: AptInfo[]                       // 자동 핀 목록 (좌표 포함)
  onAptSelect: (aptName: string, dong: string, address: string, lawdCd?: string) => void
  onMapIdle: (center: GeoPosition, radiusM: number, zoom: number) => void
}

/** 뷰포트 대각선 반경 계산 (중심 → NE 모서리) */
function calcRadius(center: GeoPosition, ne: GeoPosition): number {
  const dLat = Math.abs(ne.lat - center.lat) * 111320
  const dLng = Math.abs(ne.lng - center.lng) * 111320 * Math.cos(center.lat * Math.PI / 180)
  return Math.min(Math.ceil(Math.sqrt(dLat * dLat + dLng * dLng)), 2000)
}

/** 좌표 → reverseGeocode → 법정동코드(10자리) */
function fetchLawdCdFromCoords(latlng: naver.maps.LatLng): Promise<string> {
  return new Promise((resolve) => {
    naver.maps.Service.reverseGeocode(
      { coords: latlng, orders: 'legalcode' as never },
      (_status, response) => {
        const legal = response.v2?.results.find((r) => r.name === 'legalcode')
        resolve(legal?.code?.id ?? '')
      },
    )
  })
}

/** 클릭 좌표를 reverseGeocode → 건물명(아파트명) 추출 */
function detectAptAtPoint(latlng: naver.maps.LatLng): Promise<{ aptName: string; dong: string; address: string; lawdCd: string } | null> {
  return new Promise((resolve) => {
    naver.maps.Service.reverseGeocode(
      { coords: latlng, orders: 'addr,legalcode' as never },
      (_status, response) => {
        const v2 = response.v2
        if (!v2 || v2.status.code !== 0) { resolve(null); return }

        const addrResult = v2.results.find((r) => r.name === 'addr')
        const aptName = addrResult?.land?.addition0?.value?.trim() ?? ''
        if (!aptName) { resolve(null); return }  // 건물명 없으면 아파트 아님

        const legal = v2.results.find((r) => r.name === 'legalcode')
        const reg = legal?.region
        const dong = reg?.area3?.name?.trim() ?? ''
        const lawdCd = legal?.code?.id ?? ''
        const address = [reg?.area1?.name, reg?.area2?.name, reg?.area3?.name, reg?.area4?.name]
          .filter(Boolean)
          .join(' ')
          .trim()

        resolve({ aptName, dong, address, lawdCd })
      },
    )
  })
}

export function useNaverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { initialPosition, myPosition, aptList, onAptSelect, onMapIdle }: UseNaverMapOptions,
) {
  const mapRef = useRef<naver.maps.Map | null>(null)
  const myDotRef = useRef<naver.maps.Marker | null>(null)
  const aptMarkersRef = useRef<naver.maps.Marker[]>([])
  const selectedMarkerRef = useRef<naver.maps.Marker | null>(null)

  // 콜백은 항상 최신 참조를 사용
  const onAptSelectRef = useRef(onAptSelect)
  useEffect(() => { onAptSelectRef.current = onAptSelect }, [onAptSelect])
  const onMapIdleRef = useRef(onMapIdle)
  useEffect(() => { onMapIdleRef.current = onMapIdle }, [onMapIdle])

  // ── 지도 초기화 ──
  useEffect(() => {
    if (!containerRef.current || typeof window.naver === 'undefined') return

    const center = new naver.maps.LatLng(initialPosition.lat, initialPosition.lng)
    const map = new naver.maps.Map(containerRef.current, {
      center,
      zoom: 16,
      mapTypeControl: false,
      logoControl: false,
      scaleControl: false,
      mapDataControl: false,
      tileSpare: 7,
      disableKineticPan: false,
    })
    mapRef.current = map

    // 지도 idle → 중심 좌표 + 뷰포트 반경 + zoom 전달
    naver.maps.Event.addListener(map, 'idle', () => {
      const c = map.getCenter()
      const centerPos: GeoPosition = { lat: c.lat(), lng: c.lng() }
      const bounds = map.getBounds()
      let radiusM = 1000
      if (bounds) {
        const ne = bounds.getNE()
        radiusM = calcRadius(centerPos, { lat: ne.lat(), lng: ne.lng() })
      }
      onMapIdleRef.current(centerPos, radiusM, map.getZoom())
    })

    // 초기 idle 수동 트리거 (첫 로드)
    const triggerInitialIdle = () => {
      const bounds = map.getBounds()
      let radiusM = 1000
      if (bounds) {
        const ne = bounds.getNE()
        radiusM = calcRadius(
          { lat: initialPosition.lat, lng: initialPosition.lng },
          { lat: ne.lat(), lng: ne.lng() },
        )
      }
      onMapIdleRef.current({ lat: initialPosition.lat, lng: initialPosition.lng }, radiusM, map.getZoom())
    }
    triggerInitialIdle()

    // ── 드래그 중 주기적 갱신 (1.5초마다) ──
    let dragIntervalId: ReturnType<typeof setInterval> | null = null

    const fireCurrent = () => {
      const c = map.getCenter()
      const centerPos: GeoPosition = { lat: c.lat(), lng: c.lng() }
      const bounds = map.getBounds()
      let radiusM = 1000
      if (bounds) {
        const ne = bounds.getNE()
        radiusM = calcRadius(centerPos, { lat: ne.lat(), lng: ne.lng() })
      }
      onMapIdleRef.current(centerPos, radiusM, map.getZoom())
    }

    naver.maps.Event.addListener(map, 'dragstart', () => {
      dragIntervalId = setInterval(fireCurrent, 1500)
    })

    naver.maps.Event.addListener(map, 'dragend', () => {
      if (dragIntervalId !== null) {
        clearInterval(dragIntervalId)
        dragIntervalId = null
      }
    })

    // ── 지도 클릭 → 아파트 감지 ──
    naver.maps.Event.addListener(map, 'click', async (...args: unknown[]) => {
      const e = args[0] as { latlng: naver.maps.LatLng }
      const detected = await detectAptAtPoint(e.latlng)
      if (!detected) return

      // 클릭 위치에 선택 마커 표시
      selectedMarkerRef.current?.setMap(null)
      selectedMarkerRef.current = new naver.maps.Marker({
        position: e.latlng,
        map,
        icon: {
          content: `<div style="
            width:14px;height:14px;
            background:#2563eb;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 2px 6px rgba(37,99,235,.5);
          "></div>`,
          anchor: new naver.maps.Point(7, 7),
        },
        clickable: false,
      })

      onAptSelectRef.current(detected.aptName, detected.dong, detected.address, detected.lawdCd)
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (dragIntervalId !== null) clearInterval(dragIntervalId)
      aptMarkersRef.current.forEach((m) => m.setMap(null))
      aptMarkersRef.current = []
      myDotRef.current?.setMap(null)
      selectedMarkerRef.current?.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef])

  // ── 내 위치 빨간 점 ──
  useEffect(() => {
    if (!mapRef.current || !myPosition) return
    const latlng = new naver.maps.LatLng(myPosition.lat, myPosition.lng)
    if (myDotRef.current) {
      myDotRef.current.setPosition(latlng)
    } else {
      myDotRef.current = new naver.maps.Marker({
        position: latlng,
        map: mapRef.current,
        icon: {
          content: `<div style="
            width:12px;height:12px;
            background:#ef4444;
            border:2.5px solid white;
            border-radius:50%;
            box-shadow:0 1px 4px rgba(0,0,0,.35);
          "></div>`,
          anchor: new naver.maps.Point(6, 6),
        },
        clickable: false,
        zIndex: 100,
      })
    }
  }, [myPosition])

  // ── 아파트 핀 (좌표 직접 사용, 지오코딩 없음) ──
  useEffect(() => {
    aptMarkersRef.current.forEach((m) => m.setMap(null))
    aptMarkersRef.current = []

    if (!aptList.length || !mapRef.current) return

    const map = mapRef.current

    aptList.forEach((apt) => {
      if (!apt.lat || !apt.lng) return

      const label = apt.aptName.length > 9 ? apt.aptName.slice(0, 9) + '…' : apt.aptName
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(apt.lat, apt.lng),
        map,
        icon: {
          content: `
            <div style="display:flex;flex-direction:column;align-items:center;width:84px;cursor:pointer;">
              <div style="
                background:#f97316;color:#fff;
                border-radius:8px;padding:3px 8px;
                font-size:10px;font-weight:700;
                white-space:nowrap;
                box-shadow:0 2px 6px rgba(0,0,0,.25);
                font-family:-apple-system,sans-serif;
                max-width:84px;overflow:hidden;text-overflow:ellipsis;text-align:center;
              ">${label}</div>
              <div style="
                width:6px;height:6px;
                background:#f97316;
                border:2px solid white;
                border-radius:50%;margin-top:2px;
              "></div>
            </div>`,
          anchor: new naver.maps.Point(42, 28),
        },
        zIndex: 50,
      })

      naver.maps.Event.addListener(marker, 'click', async () => {
        selectedMarkerRef.current?.setMap(null)
        const latlng = new naver.maps.LatLng(apt.lat, apt.lng)
        const lawdCd = await fetchLawdCdFromCoords(latlng)
        onAptSelectRef.current(apt.aptName, apt.dong, apt.address, lawdCd || undefined)
      })

      aptMarkersRef.current.push(marker)
    })

    return () => {
      aptMarkersRef.current.forEach((m) => m.setMap(null))
      aptMarkersRef.current = []
    }
  }, [aptList])

  // ── 외부에서 지도 이동 ──
  const moveMap = useCallback((position: GeoPosition) => {
    if (!mapRef.current) return
    mapRef.current.setCenter(new naver.maps.LatLng(position.lat, position.lng))
  }, [])

  return { moveMap }
}
