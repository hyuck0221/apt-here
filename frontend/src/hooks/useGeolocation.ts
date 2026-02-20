import { useState, useEffect } from 'react'

// 강남구 역삼동 기본 좌표 (fallback)
const FALLBACK_LAT = 37.5012
const FALLBACK_LNG = 127.0396

export interface GeoPosition {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [position, setPosition] = useState<GeoPosition>({
    lat: FALLBACK_LAT,
    lng: FALLBACK_LNG,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setLoading(false)
      },
      () => {
        // 위치 권한 거부 또는 오류 시 기본값 사용
        setLoading(false)
      },
      { timeout: 5000, maximumAge: 60000 }
    )
  }, [])

  return { position, loading }
}
