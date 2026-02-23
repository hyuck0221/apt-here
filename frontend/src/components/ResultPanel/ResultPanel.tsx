import styles from './ResultPanel.module.css'
import { AptCard } from './AptCard'
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner'
import type { AptPriceResponse } from '../../types/api'

interface ResultPanelProps {
  isOpen: boolean
  isLoading: boolean
  isSlowLoading?: boolean
  result: AptPriceResponse | null
  error: string | null
  onClose: () => void
}

function PanelContent({
  isLoading, isSlowLoading, result, error, onClose,
}: Omit<ResultPanelProps, 'isOpen'>) {
  const loadingMessage = isSlowLoading
    ? '아파트 정보 업데이트 중입니다'
    : '아파트 실거래가 조회 중...'

  return (
    <>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {result && <p className={styles.address}>{result.dealYmd.slice(0, 4)}년 {result.dealYmd.slice(4)}월 기준</p>}
          <h2 className={styles.title}>
            {result ? `아파트 실거래가 (${result.items.length}건)` : '검색 결과'}
          </h2>
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="패널 닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {isLoading && <LoadingSpinner message={loadingMessage} />}

        {error && !isLoading && (
          <div className={styles.stateBox}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)' }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className={styles.stateText}>{error}</p>
          </div>
        )}

        {result && !isLoading && (
          result.items.length === 0 ? (
            <div className={styles.stateBox}>
              <p className={styles.stateText}>이 지역의 실거래가 데이터가 없습니다.</p>
            </div>
          ) : (
            <ul className={styles.cardList}>
              {result.items.map((apt, index) => (
                <li key={index}>
                  <AptCard apt={apt} />
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </>
  )
}

export function ResultPanel({ isOpen, isLoading, isSlowLoading, result, error, onClose }: ResultPanelProps) {
  return (
    /* 모바일: 바깥 클릭(배경) 시 닫힘 / 데스크탑: flex 사이드바 */
    <div
      className={`${styles.panel} ${isOpen ? styles.open : ''}`}
      onClick={onClose}
      role="complementary"
      aria-label="검색 결과"
    >
      {/* 클릭 이벤트 버블링 차단 — 내부 클릭은 닫히지 않음 */}
      <div className={styles.inner} onClick={e => e.stopPropagation()}>
        <PanelContent
          isLoading={isLoading}
          isSlowLoading={isSlowLoading}
          result={result}
          error={error}
          onClose={onClose}
        />
      </div>
    </div>
  )
}
