import { useEffect, useRef, useCallback } from 'react'
import type { GeoPosition } from './useGeolocation'
import type { AptPriceResponse } from '../types/api'

interface UseNaverMapOptions {
  initialPosition: GeoPosition
  onPinMove: (position: GeoPosition) => void
  aptResults?: AptPriceResponse | null
}

// 모듈 레벨 geocode 캐시 — 동일 쿼리 반복 API 호출 방지
const geocodeCache = new Map<string, GeoPosition | null>()

// coordinate: "경도,위도" 형식의 검색 우선순위 힌트
function geocodeApt(query: string, coordinate: string): Promise<GeoPosition | null> {
  if (geocodeCache.has(query)) {
    return Promise.resolve(geocodeCache.get(query) ?? null)
  }
  return new Promise((resolve) => {
    naver.maps.Service.geocode({ query, coordinate }, (_status, response) => {
      // 실제 응답은 v2 래퍼 없이 최상위 addresses 배열
      const addresses = response.addresses
      if (!addresses || addresses.length === 0) {
        geocodeCache.set(query, null)
        resolve(null)
        return
      }
      const item = addresses[0]
      const pos: GeoPosition = { lat: parseFloat(item.y), lng: parseFloat(item.x) }
      geocodeCache.set(query, pos)
      resolve(pos)
    })
  })
}

function haversineDistance(a: GeoPosition, b: GeoPosition): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export function useNaverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { initialPosition, onPinMove, aptResults }: UseNaverMapOptions
) {
  const mapRef = useRef<naver.maps.Map | null>(null)
  const markerRef = useRef<naver.maps.Marker | null>(null)
  const aptMarkersRef = useRef<naver.maps.Marker[]>([])

  // 지도 및 메인 핀 초기화
  useEffect(() => {
    if (!containerRef.current) return
    if (typeof window.naver === 'undefined') {
      console.error('Naver Maps SDK가 로드되지 않았습니다. Client ID를 확인하세요.')
      return
    }

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

    const marker = new naver.maps.Marker({
      position: center,
      map,
      draggable: true,
      icon: {
        content: `
          <div style="
            width: 32px;
            height: 32px;
            background: var(--color-primary, #2563eb);
            border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        `,
        anchor: new naver.maps.Point(16, 32),
      },
    })

    mapRef.current = map
    markerRef.current = marker

    // 마커 드래그 종료 이벤트
    naver.maps.Event.addListener(marker, 'dragend', () => {
      const pos = marker.getPosition()
      onPinMove({ lat: pos.lat(), lng: pos.lng() })
    })

    // 지도 클릭 시 핀 이동
    naver.maps.Event.addListener(map, 'click', (...args: unknown[]) => {
      const e = args[0] as { latlng: naver.maps.LatLng }
      const latlng = e.latlng
      marker.setPosition(latlng)
      onPinMove({ lat: latlng.lat(), lng: latlng.lng() })
    })

    return () => {
      marker.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef])

  // 아파트 결과 마커 표시 — 선택 핀 반경 2km 이내 최대 30개
  useEffect(() => {
    // 기존 아파트 마커 제거
    aptMarkersRef.current.forEach((m) => m.setMap(null))
    aptMarkersRef.current = []

    if (!aptResults?.items.length || !mapRef.current || !markerRef.current) return

    const map = mapRef.current
    const pinPos = markerRef.current.getPosition()
    const center: GeoPosition = { lat: pinPos.lat(), lng: pinPos.lng() }

    // 고유 아파트 목록 (aptName 기준 중복 제거)
    const seen = new Set<string>()
    const uniqueApts: string[] = []
    for (const item of aptResults.items) {
      if (!seen.has(item.aptName)) {
        seen.add(item.aptName)
        uniqueApts.push(item.aptName)
      }
    }

    let cancelled = false
    // 핀 위치를 coordinate 힌트로 전달 → 동명 아파트가 여러 곳일 때 가장 가까운 결과 우선
    const coordinateHint = `${center.lng},${center.lat}`

    uniqueApts.slice(0, 30).forEach(async (aptName) => {
      const pos = await geocodeApt(aptName, coordinateHint)
      if (cancelled || !pos || !mapRef.current) return
      if (haversineDistance(center, pos) > 2000) return

      const label = aptName.length > 9 ? aptName.slice(0, 9) + '…' : aptName
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(pos.lat, pos.lng),
        map,
        icon: {
          content: `<div style="display:flex;flex-direction:column;align-items:center;width:80px;pointer-events:none;">
            <div style="background:#f97316;color:#fff;border-radius:8px;padding:2px 7px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25);font-family:-apple-system,sans-serif;overflow:hidden;text-overflow:ellipsis;text-align:center;max-width:80px;">${label}</div>
            <div style="width:6px;height:6px;background:#f97316;border:2px solid #fff;border-radius:50%;margin-top:2px;flex-shrink:0;"></div>
          </div>`,
          anchor: new naver.maps.Point(40, 26),
        },
      })

      if (cancelled) {
        marker.setMap(null)
      } else {
        aptMarkersRef.current.push(marker)
      }
    })

    return () => {
      cancelled = true
      aptMarkersRef.current.forEach((m) => m.setMap(null))
      aptMarkersRef.current = []
    }
  }, [aptResults])

  // 외부에서 핀 위치 업데이트 (초기 GPS 좌표 받은 후)
  const movePin = useCallback((position: GeoPosition) => {
    if (!mapRef.current || !markerRef.current) return
    const latlng = new naver.maps.LatLng(position.lat, position.lng)
    markerRef.current.setPosition(latlng)
    mapRef.current.setCenter(latlng)
  }, [])

  return { movePin }
}
