import type { RentItem } from '../../types/api'
import styles from './AptCard.module.css'

interface AptCardProps {
  apt: RentItem
}

function fmtAmt(val: number | null): string {
  if (val === null || val === 0) return '-'
  if (val >= 10000) {
    const eok = Math.floor(val / 10000)
    const man = val % 10000
    return man > 0 ? `${eok}억 ${man.toLocaleString()}` : `${eok}억`
  }
  return `${val.toLocaleString()}만`
}

export function AptCard({ apt }: AptCardProps) {
  const isJeonse = apt.rentType === 'JEONSE'

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.left}>
          <span className={`${styles.badge} ${isJeonse ? styles.jeonse : styles.wolse}`}>
            {isJeonse ? '전세' : '월세'}
          </span>
          <span className={styles.meta}>{apt.floor}층 · {apt.area}㎡</span>
        </div>
        <div className={styles.price}>
          <span className={styles.priceMain}>{fmtAmt(apt.deposit)}</span>
          {!isJeonse && apt.monthlyRent && apt.monthlyRent > 0 && (
            <span className={styles.priceSub}>/ {fmtAmt(apt.monthlyRent)}</span>
          )}
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.date}>{apt.dealDate}</span>
        {apt.contractType && (
          <span className={styles.tag}>{apt.contractType}</span>
        )}
      </div>
    </div>
  )
}
