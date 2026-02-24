import { useRef, useEffect } from 'react'
import styles from './MapView.module.css'
import { useNaverMap } from '../../hooks/useNaverMap'
import type { GeoPosition } from '../../hooks/useGeolocation'
import type { AptInfo } from '../../types/api'

interface MapViewProps {
  initialPosition: GeoPosition
  myPosition: GeoPosition | null
  aptList: AptInfo[]
  tooZoomedOut: boolean
  onAptSelect: (aptName: string, dong: string, address: string, lawdCd?: string) => void
  onMapIdle: (center: GeoPosition, radiusM: number, zoom: number) => void
  onMapReady?: (moveMap: (pos: GeoPosition) => void) => void
}

export function MapView({
  initialPosition,
  myPosition,
  aptList,
  tooZoomedOut,
  onAptSelect,
  onMapIdle,
  onMapReady,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onMapReadyRef = useRef(onMapReady)

  const { moveMap } = useNaverMap(containerRef, {
    initialPosition,
    myPosition,
    aptList,
    onAptSelect,
    onMapIdle,
  })

  useEffect(() => {
    onMapReadyRef.current?.(moveMap)
  }, [moveMap])

  return (
    <div ref={containerRef} className={styles.mapContainer}>
      {tooZoomedOut && (
        <div className={styles.zoomOverlay}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
          </svg>
          화면을 확대하면 아파트가 표시됩니다
        </div>
      )}
    </div>
  )
}
