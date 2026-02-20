import { useState, useRef, useEffect } from 'react'
import styles from './LocationSearch.module.css'
import type { GeoPosition } from '../../hooks/useGeolocation'

interface AddressResult {
  roadAddress: string
  jibunAddress: string
  x: string
  y: string
}

interface LocationSearchProps {
  onSelect: (position: GeoPosition) => void
  onClose: () => void
}

export function LocationSearch({ onSelect, onClose }: LocationSearchProps) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<AddressResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSearch = () => {
    if (!query.trim() || isSearching) return

    setIsSearching(true)
    setError(null)
    setResults([])

    naver.maps.Service.geocode({ query: query.trim() }, (_status, response) => {
      setIsSearching(false)

      const addresses = (response.addresses ??
        (response as unknown as { v2?: { addresses?: typeof response.addresses } }).v2?.addresses
      ) as AddressResult[] | undefined

      if (!addresses || addresses.length === 0) {
        setError('검색 결과가 없습니다. 다른 검색어를 입력해 주세요.')
        return
      }

      // 결과가 1개면 바로 핀 이동, 2개 이상이면 목록 표시
      if (addresses.length === 1) {
        onSelect({ lat: parseFloat(addresses[0].y), lng: parseFloat(addresses[0].x) })
        return
      }

      setResults(addresses)
    })
  }

  const handleSelect = (addr: AddressResult) => {
    onSelect({ lat: parseFloat(addr.y), lng: parseFloat(addr.x) })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inputRow}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          placeholder="지역명을 입력하세요 (예: 강남구 역삼동)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setError(null)
            setResults([])
          }}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
        >
          {isSearching ? (
            <span className={styles.spinner} />
          ) : '검색'}
        </button>
      </div>

      {error && (
        <p className={styles.error}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      )}

      {results.length > 0 && (
        <ul className={styles.resultList}>
          {results.map((addr, i) => {
            const primary = addr.roadAddress || addr.jibunAddress
            const secondary = addr.roadAddress ? addr.jibunAddress : ''
            return (
              <li key={i} className={styles.resultItem} onClick={() => handleSelect(addr)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.pinIcon}>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div className={styles.resultText}>
                  <span className={styles.primaryAddr}>{primary}</span>
                  {secondary && <span className={styles.secondaryAddr}>{secondary}</span>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
