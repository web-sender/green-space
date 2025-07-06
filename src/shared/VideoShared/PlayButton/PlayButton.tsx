import React, { memo } from 'react'
import styles from './styles.module.css'

interface PlayButtonProps {
  isPlaying: boolean
  isLoaded: boolean
  isFullscreen: boolean
  togglePlay: () => void
}

function PlayButton({ isPlaying, isLoaded, isFullscreen, togglePlay }: PlayButtonProps) {
  return (
    <button
      className={`${styles.button} ${isPlaying ? styles.playing : ''} ${!isLoaded ? styles.loading : ''} ${isFullscreen ? styles.fullscreen : ''}`}
      onPointerDown={togglePlay}
      disabled={!isLoaded}
    >
      <svg className={styles.circle} viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgb(var(--color-main-head))"
          strokeWidth="4"
          strokeLinecap="round"
          className={styles.loaderCircle}
        />
      </svg>
      <span className={styles.triangle} />
      <span className={styles.line} />
    </button>
  )
}

export default memo(PlayButton)