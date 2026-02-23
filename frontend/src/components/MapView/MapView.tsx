import { useRef, useEffect } from 'react'
import styles from './MapView.module.css'
import { useNaverMap } from '../../hooks/useNaverMap'
import type { GeoPosition } from '../../hooks/useGeolocation'
import type { AptPriceResponse } from '../../types/api'

interface MapViewProps {
  initialPosition: GeoPosition
  onPinMove: (position: GeoPosition) => void
  onMapReady?: (movePin: (pos: GeoPosition) => void) => void
  aptResults?: AptPriceResponse | null
}

export function MapView({ initialPosition, onPinMove, onMapReady, aptResults }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onMapReadyRef = useRef(onMapReady)

  const { movePin } = useNaverMap(containerRef, { initialPosition, onPinMove, aptResults })

  useEffect(() => {
    onMapReadyRef.current?.(movePin)
  }, [movePin])

  return <div ref={containerRef} className={styles.mapContainer} />
}
