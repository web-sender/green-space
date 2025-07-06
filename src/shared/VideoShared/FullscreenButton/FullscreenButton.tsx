'use client'
import { memo } from 'react'
import styles from './styles.module.css'

interface FullscreenButtonProps {
  isFullscreen: boolean
  toggleFullscreen: () => Promise<void>
}

function FullscreenButton({ isFullscreen, toggleFullscreen }: FullscreenButtonProps) {
  return (
    <button
      className={`${styles.button} ${isFullscreen ? styles.active : ''}`}
      onPointerDown={toggleFullscreen}
    >
      <span className={`${styles.corner} ${styles.topLeft}`} />
      <span className={`${styles.corner} ${styles.topRight}`} />
      <span className={`${styles.corner} ${styles.bottomLeft}`} />
      <span className={`${styles.corner} ${styles.bottomRight}`} />
    </button>
  )
}

export default memo(FullscreenButton)