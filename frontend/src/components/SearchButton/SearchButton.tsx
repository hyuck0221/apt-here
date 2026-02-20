import styles from './SearchButton.module.css'

interface SearchButtonProps {
  onClick: () => void
  isLoading: boolean
  isPanelOpen: boolean
}

export function SearchButton({ onClick, isLoading, isPanelOpen }: SearchButtonProps) {
  return (
    <button
      className={`${styles.button} ${isPanelOpen ? styles.panelOpen : ''}`}
      onClick={onClick}
      disabled={isLoading}
      aria-label="이 위치에서 아파트 검색"
    >
      {isLoading ? (
        <span className={styles.loadingDot} />
      ) : (
        <>
          <svg
            className={styles.icon}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <span>이 위치 검색</span>
        </>
      )}
    </button>
  )
}
