import styles from './LandingSection.module.css'

interface LandingSectionProps {
  onScrollToTop: () => void
}

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    title: '최근 1년 실거래 데이터',
    desc: '국토교통부 공공데이터 기반으로 최근 1년간의 실거래 정보를 실시간으로 제공합니다.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: '전세·월세 통합 조회',
    desc: '전세와 월세 거래 내역을 한 화면에서 확인할 수 있습니다.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: '위치 기반 핀 검색',
    desc: '지도 핀을 드래그하거나 지역명을 검색해 원하는 위치를 정확하게 선택하세요.',
  },
]

export function LandingSection({ onScrollToTop }: LandingSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.hero}>
          <p className={styles.eyebrow}>apt here · 아파트 실거래가 조회</p>
          <h2 className={styles.heading}>
            1년치 아파트<br />
            전세·월세 거래가를<br />
            한눈에 확인하세요
          </h2>
          <p className={styles.sub}>
            국토교통부 공공데이터 기반으로<br className={styles.mobileBreak} />
            내 주변 아파트의 최근 1년간 실거래 내역을<br className={styles.mobileBreak} />
            쉽고 빠르게 조회할 수 있습니다.
          </p>
          <button className={styles.cta} onClick={onScrollToTop}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            지금 검색하기
          </button>
        </div>

        <div className={styles.features}>
          {features.map((f) => (
            <div key={f.title} className={styles.card}>
              <div className={styles.iconWrap}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
