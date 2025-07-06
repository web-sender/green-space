import styles from './styles.module.css'

interface MenuButtonProps {
  isOpen: boolean
  toggle: () => void
  disabled: boolean
}

export default function MenuButton({ isOpen, toggle, disabled }: MenuButtonProps) {

  return (
    <button
      className={`${styles.menuButton} ${isOpen ? styles.active : ''}`}
      onClick={toggle}
      disabled={disabled}
    >
      <svg className={styles.menuIcon} viewBox="0 0 24 24">
        <path
          className={`${styles.line} ${styles.line1}`}
          d="M3 6h18"
        />
        <path
          className={`${styles.line} ${styles.line2}`}
          d="M3 12h18"
        />
        <path
          className={`${styles.line} ${styles.line3}`}
          d="M3 18h18"
        />
      </svg>
    </button>
  );
}