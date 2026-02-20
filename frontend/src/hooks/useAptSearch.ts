import { useState, useCallback } from 'react'
import { findAptPrices } from '../api/aptClient'
import type { AptPriceResponse } from '../types/api'
import type { GeoPosition } from './useGeolocation'

type SearchStatus = 'idle' | 'geocoding' | 'fetching' | 'success' | 'error'

function reverseGeocode(position: GeoPosition): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window.naver === 'undefined') {
      reject(new Error('Naver Maps SDK가 로드되지 않았습니다.'))
      return
    }

    naver.maps.Service.reverseGeocode(
      { coords: new naver.maps.LatLng(position.lat, position.lng) },
      (_status, response) => {
        const v2 = response.v2
        if (!v2 || v2.status.code !== 0) {
          reject(new Error('주소를 가져오는 데 실패했습니다.'))
          return
        }

        const addr = (v2.address.roadAddress || v2.address.jibunAddress)?.trim()
        if (!addr) {
          reject(new Error('해당 위치의 주소를 찾을 수 없습니다.'))
          return
        }

        resolve(addr)
      }
    )
  })
}

export function useAptSearch() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [result, setResult] = useState<AptPriceResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (position: GeoPosition) => {
    setStatus('geocoding')
    setError(null)

    try {
      const address = await reverseGeocode(position)

      setStatus('fetching')
      const data = await findAptPrices({ address })

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

  const isLoading = status === 'geocoding' || status === 'fetching'

  return { search, reset, status, result, error, isLoading }
}
