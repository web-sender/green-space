"use client"
import {
	useState, useEffect, useCallback, memo,
	Dispatch, SetStateAction, ChangeEvent, CSSProperties
} from 'react'
import styles from './styles.module.css'

interface SeekBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  setStopDragging: Dispatch<SetStateAction<boolean>>
}

function SeekBar({ currentTime, duration, onSeek, setStopDragging }: SeekBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const onDragging = useCallback( (isDrag: boolean): void => {
  	setStopDragging(isDrag)
  }, [setStopDragging])
  
  useEffect(() => {
    onDragging(isDragging)
  }, [isDragging, onDragging])
  
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value)
    onSeek(newTime)
  }
  const handlePointerDown = () => {
		setIsDragging(true);
	}
  const handlePointerUp = () => {
		setIsDragging(false)
	}

  return (
    <input
      onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
      type="range"
      className={styles.seekBar}
      min="0"
      max={duration || 1}
      step="0.1"
      value={currentTime}
      onChange={handleChange}
      style={{ '--progress-width': `${(currentTime / (duration || 1)) * 100}%` } as CSSProperties}
    />
  )
}

export default memo(SeekBar)