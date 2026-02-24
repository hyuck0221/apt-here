import { useState } from 'react'
import styles from './ResultPanel.module.css'
import { AptCard } from './AptCard'
import { TradeCard } from './TradeCard'
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner'
import type { AptDealResponse, TradeMonthlySummary, RentMonthlySummary } from '../../types/api'

interface ResultPanelProps {
  isOpen: boolean
  isLoading: boolean
  isSlowLoading?: boolean
  result: AptDealResponse | null
  error: string | null
  onClose: () => void
}

type TabType = 'trade' | 'jeonse' | 'wolse'

/* ── 가격 포맷 (차트 Y축) ── */
function fmtChartVal(val: number): string {
  if (val >= 100000000) return `${(val / 100000000).toFixed(1)}억`
  if (val >= 10000) {
    const eok = Math.floor(val / 10000)
    return `${eok}억`
  }
  return `${Math.round(val / 1000)}천`
}

/* ── SVG 라인 차트 (generic) ── */
function TrendChart({
  values,
  labels,
  color,
  label,
}: {
  values: (number | null)[]
  labels: string[]
  color: string
  label: string
}) {
  const hasData = values.some((v) => v !== null && v > 0)
  if (!hasData) return null

  const W = 300, H = 100
  const pL = 46, pR = 8, pT = 8, pB = 22
  const iW = W - pL - pR
  const iH = H - pT - pB
  const n = values.length

  const validVals = values.filter((v): v is number => v !== null && v > 0)
  const minV = Math.min(...validVals)
  const maxV = Math.max(...validVals)
  const pad = (maxV - minV) * 0.15 || maxV * 0.05 || 500
  const lo = Math.max(0, minV - pad)
  const hi = maxV + pad
  const range = hi - lo || 1

  const xAt = (i: number) => pL + (i / (n - 1)) * iW
  const yAt = (v: number) => pT + iH - ((v - lo) / range) * iH

  let linePath = ''
  values.forEach((v, i) => {
    if (!v || v === 0) return
    const x = xAt(i).toFixed(1)
    const y = yAt(v).toFixed(1)
    const prevV = i > 0 ? values[i - 1] : null
    if (!linePath || !prevV || prevV === 0) {
      linePath += ` M ${x} ${y}`
    } else {
      linePath += ` L ${x} ${y}`
    }
  })

  let firstIdx = -1, lastIdx = -1
  values.forEach((v, i) => { if (v && v > 0) { if (firstIdx < 0) firstIdx = i; lastIdx = i } })

  const areaPath =
    linePath +
    ` L ${xAt(lastIdx).toFixed(1)} ${(pT + iH).toFixed(1)}` +
    ` L ${xAt(firstIdx).toFixed(1)} ${(pT + iH).toFixed(1)} Z`

  const ticks = [lo, (lo + hi) / 2, hi]

  return (
    <div className={styles.chartBlock}>
      <p className={styles.chartLabel}>{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg}>
        {ticks.map((t, i) => (
          <line key={i} x1={pL} y1={yAt(t).toFixed(1)} x2={W - pR} y2={yAt(t).toFixed(1)}
            stroke="var(--color-border)" strokeWidth={i === 0 ? '1' : '0.5'}
            strokeDasharray={i === 0 ? '' : '3,3'} />
        ))}
        {ticks.map((t, i) => (
          <text key={i} x={pL - 4} y={Number(yAt(t).toFixed(1)) + 4}
            textAnchor="end" fontSize="8.5" fill="var(--color-text-secondary)">
            {fmtChartVal(t)}
          </text>
        ))}
        {linePath && <path d={areaPath} fill={color} fillOpacity="0.07" />}
        {linePath && (
          <path d={linePath} stroke={color} strokeWidth="1.8" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        )}
        {values.map((v, i) =>
          v && v > 0 ? (
            <circle key={i} cx={xAt(i)} cy={yAt(v)} r="2.8"
              fill={color} stroke="white" strokeWidth="1.5" />
          ) : null
        )}
        {labels.map((lbl, i) => {
          if (i % 3 !== 0 && i !== n - 1) return null
          return (
            <text key={i} x={xAt(i)} y={pT + iH + 14}
              textAnchor="middle" fontSize="8.5" fill="var(--color-text-secondary)">
              {lbl.slice(2, 4)}.{lbl.slice(4)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

/* ── 매매 월별 거래량 바 차트 ── */
function TradeVolumeBar({ summary }: { summary: TradeMonthlySummary[] }) {
  const maxCount = Math.max(...summary.map((m) => m.count), 1)
  return (
    <div className={styles.volumeWrap}>
      {summary.map((m) => {
        const pct = (m.count / maxCount) * 100
        return (
          <div key={m.yearMonth} className={styles.volumeCol}>
            <div className={styles.volumeBarWrap}>
              <div className={styles.volumeBarInner} style={{ height: `${pct}%`, background: '#86efac' }}>
              </div>
            </div>
            <span className={styles.volumeLabel}>{m.yearMonth.slice(4)}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── 전월세 월별 거래량 바 차트 ── */
function RentVolumeBar({ summary }: { summary: RentMonthlySummary[] }) {
  const maxCount = Math.max(...summary.map((m) => m.jeonseCount + m.wolseCount), 1)
  return (
    <div className={styles.volumeWrap}>
      {summary.map((m) => {
        const total = m.jeonseCount + m.wolseCount
        const pct = (total / maxCount) * 100
        return (
          <div key={m.yearMonth} className={styles.volumeCol}>
            <div className={styles.volumeBarWrap}>
              <div className={styles.volumeBarInner} style={{ height: `${pct}%` }}>
                <div className={styles.volumeBarJeonse}
                  style={{ height: `${(m.jeonseCount / (total || 1)) * 100}%` }} />
              </div>
            </div>
            <span className={styles.volumeLabel}>{m.yearMonth.slice(4)}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── 패널 콘텐츠 ── */
function PanelContent({
  isLoading, isSlowLoading, result, error, onClose,
}: Omit<ResultPanelProps, 'isOpen'>) {
  const [activeTab, setActiveTab] = useState<TabType>('trade')
  const loadingMessage = isSlowLoading
    ? '아파트 정보 업데이트 중입니다'
    : '아파트 실거래가 조회 중...'

  const tradeCount = result?.trade.totalCount ?? 0
  const jeonseCount = result?.rent.jeonseCount ?? 0
  const wolseCount = result?.rent.wolseCount ?? 0

  return (
    <>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          {result && (
            <>
              <h2 className={styles.title}>{result.aptName || '검색 결과'}</h2>
              <p className={styles.subtitle}>
                {[result.dong, result.buildYear ? `${result.buildYear}년 준공` : ''].filter(Boolean).join(' · ')}
              </p>
            </>
          )}
          {!result && <h2 className={styles.title}>검색 결과</h2>}
        </div>
        <button className={styles.closeButton} onClick={onClose} aria-label="패널 닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className={styles.body}>
        {/* 로딩 */}
        {isLoading && <LoadingSpinner message={loadingMessage} />}

        {/* 에러 */}
        {error && !isLoading && (
          <div className={styles.stateBox}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p className={styles.stateText}>{error}</p>
          </div>
        )}

        {/* 결과 */}
        {result && !isLoading && (
          <>
            {/* 탭 바 */}
            <div className={styles.tabBar}>
              <button
                className={`${styles.tab} ${activeTab === 'trade' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('trade')}
              >
                매매 <span className={styles.tabCount}>{tradeCount}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'jeonse' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('jeonse')}
              >
                전세 <span className={styles.tabCount}>{jeonseCount}</span>
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'wolse' ? styles.tabActive : ''}`}
                onClick={() => setActiveTab('wolse')}
              >
                월세 <span className={styles.tabCount}>{wolseCount}</span>
              </button>
            </div>

            {/* 매매 탭 */}
            {activeTab === 'trade' && (
              tradeCount === 0 ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateText}>최근 1년간 매매 거래 데이터가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>월별 거래량</p>
                    <TradeVolumeBar summary={result.trade.monthlySummary} />
                  </div>
                  <div className={styles.section}>
                    <TrendChart
                      values={result.trade.monthlySummary.map((m) => m.avgAmount)}
                      labels={result.trade.monthlySummary.map((m) => m.yearMonth)}
                      color="#16a34a"
                      label="매매 평균 거래금액 추이"
                    />
                  </div>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>최근 매매 내역</p>
                    <ul className={styles.cardList}>
                      {result.trade.items.map((item, i) => (
                        <li key={i}><TradeCard item={item} /></li>
                      ))}
                    </ul>
                  </div>
                </>
              )
            )}

            {/* 전세 탭 */}
            {activeTab === 'jeonse' && (
              jeonseCount === 0 ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateText}>최근 1년간 전세 거래 데이터가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>월별 거래량</p>
                    <RentVolumeBar summary={result.rent.monthlySummary} />
                    <div className={styles.volumeLegend}>
                      <span className={styles.legendDot} style={{ background: '#93c5fd' }} />
                      <span>전세</span>
                    </div>
                  </div>
                  <div className={styles.section}>
                    <TrendChart
                      values={result.rent.monthlySummary.map((m) => m.jeonseAvgDeposit)}
                      labels={result.rent.monthlySummary.map((m) => m.yearMonth)}
                      color="#2563eb"
                      label="전세 평균 보증금 추이"
                    />
                  </div>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>최근 전세 내역</p>
                    <ul className={styles.cardList}>
                      {result.rent.items
                        .filter((item) => item.rentType === 'JEONSE')
                        .map((item, i) => (
                          <li key={i}><AptCard apt={item} /></li>
                        ))}
                    </ul>
                  </div>
                </>
              )
            )}

            {/* 월세 탭 */}
            {activeTab === 'wolse' && (
              wolseCount === 0 ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateText}>최근 1년간 월세 거래 데이터가 없습니다.</p>
                </div>
              ) : (
                <>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>월별 거래량</p>
                    <RentVolumeBar summary={result.rent.monthlySummary} />
                    <div className={styles.volumeLegend}>
                      <span className={styles.legendDot} style={{ background: '#fde68a' }} />
                      <span>월세</span>
                    </div>
                  </div>
                  <div className={styles.section}>
                    <TrendChart
                      values={result.rent.monthlySummary.map((m) => m.wolseAvgDeposit)}
                      labels={result.rent.monthlySummary.map((m) => m.yearMonth)}
                      color="#059669"
                      label="월세 평균 보증금 추이"
                    />
                    <TrendChart
                      values={result.rent.monthlySummary.map((m) => m.wolseAvgMonthly)}
                      labels={result.rent.monthlySummary.map((m) => m.yearMonth)}
                      color="#d97706"
                      label="월세 평균 월세금 추이"
                    />
                  </div>
                  <div className={styles.section}>
                    <p className={styles.sectionTitle}>최근 월세 내역</p>
                    <ul className={styles.cardList}>
                      {result.rent.items
                        .filter((item) => item.rentType === 'WOLSE')
                        .map((item, i) => (
                          <li key={i}><AptCard apt={item} /></li>
                        ))}
                    </ul>
                  </div>
                </>
              )
            )}
          </>
        )}
      </div>
    </>
  )
}

export function ResultPanel({ isOpen, isLoading, isSlowLoading, result, error, onClose }: ResultPanelProps) {
  return (
    <div
      className={`${styles.panel} ${isOpen ? styles.open : ''}`}
      onClick={onClose}
      role="complementary"
      aria-label="검색 결과"
    >
      <div className={styles.inner} onClick={(e) => e.stopPropagation()}>
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
