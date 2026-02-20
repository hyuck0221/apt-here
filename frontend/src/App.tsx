import { useState, useCallback, useRef, useEffect } from 'react'
import styles from './App.module.css'
import { MapView } from './components/MapView/MapView'
import { ResultPanel } from './components/ResultPanel/ResultPanel'
import { LocationSearch } from './components/LocationSearch/LocationSearch'
import { LandingSection } from './components/LandingSection/LandingSection'
import { useGeolocation } from './hooks/useGeolocation'
import { useAptSearch } from './hooks/useAptSearch'
import type { GeoPosition } from './hooks/useGeolocation'

const DEFAULT_POSITION: GeoPosition = { lat: 37.5012, lng: 127.0396 }

export default function App() {
  const [pinPosition, setPinPosition] = useState<GeoPosition>(DEFAULT_POSITION)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const movePinRef = useRef<((pos: GeoPosition) => void) | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const { position: gpsPosition, loading: gpsLoading } = useGeolocation()
  const { search, reset, isLoading, result, error } = useAptSearch()

  useEffect(() => {
    if (!gpsLoading) {
      setPinPosition(gpsPosition)
      movePinRef.current?.(gpsPosition)
    }
  }, [gpsLoading, gpsPosition])

  const handlePinMove = useCallback((position: GeoPosition) => {
    setPinPosition(position)
    setIsPanelOpen(false)
    reset()
  }, [reset])

  const handleSearch = useCallback(async () => {
    setShowLocationSearch(false)
    setIsPanelOpen(true)
    await search(pinPosition)
  }, [pinPosition, search])

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    reset()
  }, [reset])

  const handleMapReady = useCallback((movePin: (pos: GeoPosition) => void) => {
    movePinRef.current = movePin
  }, [])

  const handleMyLocation = useCallback(() => {
    setPinPosition(gpsPosition)
    movePinRef.current?.(gpsPosition)
    setIsPanelOpen(false)
    reset()
  }, [gpsPosition, reset])

  const handleLocationSelect = useCallback((position: GeoPosition) => {
    setPinPosition(position)
    movePinRef.current?.(position)
    setShowLocationSearch(false)
    reset()
  }, [reset])

  return (
    <div className={styles.app}>
      {/* ── 왼쪽: 스크롤 가능한 메인 콘텐츠 영역 ── */}
      <div className={styles.contentWrapper}>
        {/* 스크롤 최상단 기준점 */}
        <div ref={topRef} />

        {/* ── 히어로 섹션: 뷰포트 100% ── */}
        <div className={styles.heroSection}>
        <header className={styles.header}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span><span className={styles.logoApt}>apt</span><span className={styles.logoHere}> here</span></span>
          </div>
          <p className={styles.tagline}>아파트 실거래가 조회</p>
        </header>

        <main className={styles.main}>
          <div className={styles.intro}>
            <h1 className={styles.title}>내 주변 아파트<br />실거래가를 확인하세요</h1>
            <p className={styles.description}>핀을 원하는 위치로 이동한 후 검색하기를 눌러주세요</p>
          </div>

          <div className={styles.mapCard}>
            <MapView
              initialPosition={DEFAULT_POSITION}
              onPinMove={handlePinMove}
              onMapReady={handleMapReady}
            />
            <button
              className={styles.myLocationButton}
              onClick={handleMyLocation}
              aria-label="내 위치로 이동"
              title="내 위치로 이동"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                <circle cx="12" cy="12" r="7" strokeOpacity="0.25" />
              </svg>
            </button>
          </div>

          <div className={styles.actions}>
            <button
              className={styles.searchButton}
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} />
                  검색 중...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                  검색하기
                </>
              )}
            </button>

            <button
              className={`${styles.locationButton} ${showLocationSearch ? styles.locationButtonActive : ''}`}
              onClick={() => setShowLocationSearch(prev => !prev)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11" />
              </svg>
              다른 지역 검색
            </button>
          </div>

          {showLocationSearch && (
            <LocationSearch
              onSelect={handleLocationSelect}
              onClose={() => setShowLocationSearch(false)}
            />
          )}

          <p className={styles.hint}>
            지도를 클릭하거나 핀을 드래그해서 위치를 변경할 수 있어요
          </p>
        </main>

        {/* 스크롤 유도 인디케이터 */}
        <div className={styles.scrollHint}>
          <span>더 알아보기</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        </div>{/* heroSection 끝 */}

        {/* ── 랜딩 섹션 ── */}
        <LandingSection onScrollToTop={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* ── 오른쪽(데스크탑) / 중앙 다이얼로그(모바일): 결과 패널 ── */}
      <ResultPanel
        isOpen={isPanelOpen}
        isLoading={isLoading}
        result={result}
        error={error}
        onClose={handleClosePanel}
      />
    </div>
  )
}
