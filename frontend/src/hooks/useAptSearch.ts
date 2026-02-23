import { useState, useCallback, useEffect } from 'react'
import { findAptPrices } from '../api/aptClient'
import type { AptPriceResponse } from '../types/api'
import type { GeoPosition } from './useGeolocation'

type SearchStatus = 'idle' | 'geocoding' | 'fetching' | 'success' | 'error'

interface ReverseGeocodeResult {
  address: string
  dong: string
}

function reverseGeocode(position: GeoPosition): Promise<ReverseGeocodeResult> {
  return new Promise((resolve, reject) => {
    if (typeof window.naver === 'undefined') {
      reject(new Error('Naver Maps SDK가 로드되지 않았습니다.'))
      return
    }

    naver.maps.Service.reverseGeocode(
      {
        coords: new naver.maps.LatLng(position.lat, position.lng),
        orders: 'legalcode',
      },
      (_status, response) => {
        const v2 = response.v2
        if (!v2 || v2.status.code !== 0) {
          reject(new Error('주소를 가져오는 데 실패했습니다.'))
          return
        }

        const legalResult = v2.results.find((r) => r.name === 'legalcode')
        if (!legalResult) {
          reject(new Error('해당 위치의 주소를 찾을 수 없습니다.'))
          return
        }

        const { area1, area2, area3, area4 } = legalResult.region
        const dong = area3.name.trim()  // 법정동명 (예: "역삼동")
        const addr = [area1.name, area2.name, area3.name, area4.name]
          .filter(Boolean)
          .join(' ')
          .trim()

        if (!addr || !dong) {
          reject(new Error('해당 위치의 주소를 찾을 수 없습니다.'))
          return
        }

        resolve({ address: addr, dong })
      }
    )
  })
}

export function useAptSearch() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [result, setResult] = useState<AptPriceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSlowLoading, setIsSlowLoading] = useState(false)

  const isLoading = status === 'geocoding' || status === 'fetching'

  // 3초 이상 로딩 중이면 isSlowLoading = true
  useEffect(() => {
    if (!isLoading) {
      setIsSlowLoading(false)
      return
    }
    const timer = setTimeout(() => setIsSlowLoading(true), 3000)
    return () => clearTimeout(timer)
  }, [isLoading])

  const search = useCallback(async (position: GeoPosition) => {
    setStatus('geocoding')
    setError(null)

    try {
      const { address, dong } = await reverseGeocode(position)

      setStatus('fetching')
      const data = await findAptPrices({ address, dong })

      setResult(data)
      setStatus('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setError(message)
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { search, reset, status, result, error, isLoading, isSlowLoading }
}
