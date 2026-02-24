import { useState, useCallback, useEffect } from 'react'
import { findAptDeals } from '../api/aptClient'
import type { AptDealResponse } from '../types/api'

type SearchStatus = 'idle' | 'fetching' | 'success' | 'error'

interface SearchParams {
  address?: string
  lawdCd?: string
  dong: string
  aptName: string
}

export function useAptSearch() {
  const [status, setStatus] = useState<SearchStatus>('idle')
  const [result, setResult] = useState<AptDealResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSlowLoading, setIsSlowLoading] = useState(false)

  const isLoading = status === 'fetching'

  useEffect(() => {
    if (!isLoading) { setIsSlowLoading(false); return }
    const t = setTimeout(() => setIsSlowLoading(true), 3000)
    return () => clearTimeout(t)
  }, [isLoading])

  const search = useCallback(async ({ address, lawdCd, dong, aptName }: SearchParams) => {
    setStatus('fetching')
    setError(null)
    try {
      const data = await findAptDeals({ address, lawdCd, dong, aptName })
      setResult(data)
      setStatus('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
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
