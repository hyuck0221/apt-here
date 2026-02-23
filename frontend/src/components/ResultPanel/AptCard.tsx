import type { AptRentItem } from '../../types/api'
import styles from './AptCard.module.css'

interface AptCardProps {
  apt: AptRentItem
}

function formatAmount(raw: string): string {
  const num = parseInt(raw.replace(/,/g, ''), 10)
  if (isNaN(num) || num === 0) return '-'
  if (num >= 10000) {
    const eok = Math.floor(num / 10000)
    const man = num % 10000
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  return `${num.toLocaleString()}만원`
}

export function AptCard({ apt }: AptCardProps) {
  const isJeonse = apt.rentType === '전세'

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.aptName}>{apt.aptName}</h3>
        <span className={`${styles.badge} ${isJeonse ? styles.jeonse : styles.wolse}`}>
          {apt.rentType}
        </span>
      </div>

      <p className={styles.meta}>
        {apt.dong} · {apt.floor}층 · {apt.area}㎡
        {apt.buildYear ? ` · ${apt.buildYear}년 건축` : ''}
      </p>

      <div className={styles.priceBlock}>
        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>보증금</span>
          <span className={styles.priceValue}>{formatAmount(apt.deposit)}</span>
        </div>
        {!isJeonse && apt.monthlyRent !== '0' && apt.monthlyRent !== '' && (
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>월&nbsp;&nbsp;&nbsp;세</span>
            <span className={styles.priceValue}>{formatAmount(apt.monthlyRent)}</span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.date}>{apt.dealDate}</span>
        {apt.contractType && (
          <span className={styles.contractType}>{apt.contractType}</span>
        )}
      </div>
    </div>
  )
}
