import { useEffect, useRef, useCallback } from 'react'
import type { GeoPosition } from './useGeolocation'

interface UseNaverMapOptions {
  initialPosition: GeoPosition
  onPinMove: (position: GeoPosition) => void
}

export function useNaverMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  { initialPosition, onPinMove }: UseNaverMapOptions
) {
  const mapRef = useRef<naver.maps.Map | null>(null)
  const markerRef = useRef<naver.maps.Marker | null>(null)

  // 지도 및 마커 초기화
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
      // cleanup: marker 제거
      marker.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef])

  // 외부에서 핀 위치 업데이트 (초기 GPS 좌표 받은 후)
  const movePin = useCallback((position: GeoPosition) => {
    if (!mapRef.current || !markerRef.current) return
    const latlng = new naver.maps.LatLng(position.lat, position.lng)
    markerRef.current.setPosition(latlng)
    mapRef.current.setCenter(latlng)
  }, [])

  return { movePin }
}
