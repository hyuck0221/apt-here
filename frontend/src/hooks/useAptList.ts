import { useState, useCallback, useRef, useEffect } from 'react'
import { listApts } from '../api/aptClient'
import type { AptInfo } from '../types/api'
import type { GeoPosition } from './useGeolocation'

export function useAptList() {
  const [apartments, setApartments] = useState<AptInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchForCenter = useCallback(async (center: GeoPosition, radiusM: number) => {
    try {
      setIsLoading(true)
      const result = await listApts({ lat: center.lat, lng: center.lng, radius: radiusM })
      setApartments(result.apartments)
    } catch {
      setApartments([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  /** 지도 중심이 바뀔 때 호출. 300ms 디바운스 */
  const updateCenter = useCallback(
    (center: GeoPosition, radiusM: number = 1000) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => fetchForCenter(center, radiusM), 300)
    },
    [fetchForCenter],
  )

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { apartments, isLoading, updateCenter }
}
