import type { TradeItem } from '../../types/api'
import styles from './AptCard.module.css'

interface TradeCardProps {
  item: TradeItem
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

export function TradeCard({ item }: TradeCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.left}>
          <span className={`${styles.badge} ${styles.trade}`}>매매</span>
          <span className={styles.meta}>{item.floor}층 · {item.area}㎡</span>
        </div>
        <div className={styles.price}>
          <span className={styles.priceMain}>{fmtAmt(item.dealAmount)}</span>
        </div>
      </div>
      <div className={styles.bottom}>
        <span className={styles.date}>{item.dealDate}</span>
        {item.dealingGbn && (
          <span className={styles.tag}>{item.dealingGbn}</span>
        )}
        {item.cdealType && (
          <span className={styles.tag}>{item.cdealType}</span>
        )}
      </div>
    </div>
  )
}
