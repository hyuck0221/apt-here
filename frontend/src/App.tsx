import { useState, useCallback, useRef, useEffect } from 'react'
import styles from './App.module.css'
import { MapView } from './components/MapView/MapView'
import { ResultPanel } from './components/ResultPanel/ResultPanel'
import { LocationSearch } from './components/LocationSearch/LocationSearch'
import { LandingSection } from './components/LandingSection/LandingSection'
import { useGeolocation } from './hooks/useGeolocation'
import { useAptSearch } from './hooks/useAptSearch'
import { useAptList } from './hooks/useAptList'
import type { GeoPosition } from './hooks/useGeolocation'

const DEFAULT_POSITION: GeoPosition = { lat: 37.5012, lng: 127.0396 }

export default function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [tooZoomedOut, setTooZoomedOut] = useState(false)

  const MIN_ZOOM = 14
  const moveMapRef = useRef<((pos: GeoPosition) => void) | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  const { position: gpsPosition, loading: gpsLoading } = useGeolocation()
  const { search, reset, isLoading, isSlowLoading, result, error } = useAptSearch()
  const { apartments, updateCenter } = useAptList()

  // GPS 위치 확정 시 지도 이동
  useEffect(() => {
    if (!gpsLoading) {
      moveMapRef.current?.(gpsPosition)
    }
  }, [gpsLoading, gpsPosition])

  // 아파트 핀 클릭 or 지도 클릭 감지 → 검색
  const handleAptSelect = useCallback(
    async (aptName: string, dong: string, address: string, lawdCd?: string) => {
      setIsPanelOpen(true)
      await search({ aptName, dong, address, lawdCd })
    },
    [search],
  )

  // 지도 idle → zoom 확인 후 apt list 갱신
  const handleMapIdle = useCallback(
    (center: GeoPosition, radiusM: number, zoom: number) => {
      if (zoom < MIN_ZOOM) {
        setTooZoomedOut(true)
      } else {
        setTooZoomedOut(false)
        updateCenter(center, radiusM)
      }
    },
    [updateCenter, MIN_ZOOM],
  )

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false)
    reset()
  }, [reset])

  const handleMapReady = useCallback((moveMap: (pos: GeoPosition) => void) => {
    moveMapRef.current = moveMap
  }, [])

  // 내 위치 버튼 → 지도 이동만
  const handleMyLocation = useCallback(() => {
    moveMapRef.current?.(gpsPosition)
  }, [gpsPosition])

  // 지역 검색 → 지도 이동만 (검색 없음)
  const handleLocationSelect = useCallback((position: GeoPosition) => {
    moveMapRef.current?.(position)
    setShowLocationSearch(false)
  }, [])

  return (
    <div className={styles.app}>
      {/* ── 왼쪽: 스크롤 가능한 메인 콘텐츠 영역 ── */}
      <div className={styles.contentWrapper}>
        <div ref={topRef} />

        {/* ── 히어로 섹션 ── */}
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
              <p className={styles.description}>지도에서 아파트 핀을 클릭하거나, 아파트 건물을 직접 눌러보세요</p>
            </div>

            <div className={styles.mapCard}>
              <MapView
                initialPosition={DEFAULT_POSITION}
                myPosition={gpsLoading ? null : gpsPosition}
                aptList={tooZoomedOut ? [] : apartments}
                tooZoomedOut={tooZoomedOut}
                onAptSelect={handleAptSelect}
                onMapIdle={handleMapIdle}
                onMapReady={handleMapReady}
              />
              {/* 내 위치 버튼 */}
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
                className={`${styles.locationButton} ${showLocationSearch ? styles.locationButtonActive : ''}`}
                onClick={() => setShowLocationSearch((prev) => !prev)}
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
              지도를 움직이면 주변 아파트가 자동으로 표시됩니다 · 핀 또는 건물 클릭 시 실거래가 조회
            </p>
          </main>

          <div className={styles.scrollHint}>
            <span>더 알아보기</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        {/* ── 랜딩 섹션 ── */}
        <LandingSection onScrollToTop={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* ── 결과 패널 ── */}
      <ResultPanel
        isOpen={isPanelOpen}
        isLoading={isLoading}
        isSlowLoading={isSlowLoading}
        result={result}
        error={error}
        onClose={handleClosePanel}
      />
    </div>
  )
}
