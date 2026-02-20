import type { AptInfo } from '../../types/api'
import styles from './AptCard.module.css'

interface AptCardProps {
  apt: AptInfo
}

function formatPrice(amount: number): string {
  if (amount >= 10000) {
    const eok = Math.floor(amount / 10000)
    const man = amount % 10000
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`
  }
  return `${amount.toLocaleString()}만원`
}

export function AptCard({ apt }: AptCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.aptName}>{apt.aptName}</h3>
        <span className={styles.floor}>{apt.floor}층</span>
      </div>
      <p className={styles.address}>{apt.address}</p>
      <div className={styles.footer}>
        <div className={styles.priceInfo}>
          <span className={styles.price}>{formatPrice(apt.dealAmount)}</span>
          <span className={styles.area}>{apt.exclusiveArea}㎡</span>
        </div>
        <span className={styles.date}>
          {apt.dealYear}.{String(apt.dealMonth).padStart(2, '0')}.{String(apt.dealDay).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}
