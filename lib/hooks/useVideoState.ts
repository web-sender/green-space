import { useState, useCallback, RefObject } from 'react'

export interface IVideoState {
  isMute: boolean
  isPlaying: boolean
  isEnded: boolean
  currentTime: number
  duration: number
  isLoaded: boolean
  error: string | null
}

export function useVideoState(videoRef: RefObject<HTMLVideoElement>) {
  const [videoState, setVideoState] = useState<IVideoState>({
    isMute: false,
    isPlaying: false,
    isEnded: false,
    currentTime: 0,
    duration: 0,
    isLoaded: false,
    error: null,
  })

  // Стабилизируем updateVideoState с помощью useCallback
  const updateVideoState = useCallback((updates: Partial<IVideoState>) => {
    setVideoState((prev) => ({ ...prev, ...updates }))
  }, []) // Пустой массив зависимостей, так как setVideoState стабильна

  // Стабилизируем togglePlay
  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return;

    if (videoState.isPlaying) {
      video.pause()
      updateVideoState({ isPlaying: false })
    } else {
      video.play()
        .then(() => {
          updateVideoState({ isPlaying: true })
        })
        .catch((err) => {
          updateVideoState({
            isPlaying: false,
            error: `Failed to play video: ${err.message}`,
          })
        })
    }
  }, [videoRef, videoState.isPlaying, updateVideoState])

  // Стабилизируем toggleMute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted
      videoRef.current.muted = newMuted
      updateVideoState({ isMute: newMuted })
    }
  }, [videoRef, updateVideoState])

  // Стабилизируем setCurrentTime
  const setCurrentTime = useCallback((time: number) => {
    updateVideoState({ currentTime: time })
  }, [updateVideoState])

  // Стабилизируем setDuration
  const setDuration = useCallback((duration: number) => {
    updateVideoState({ duration })
  }, [updateVideoState])

  // Стабилизируем setLoaded
  const setLoaded = useCallback((isLoaded: boolean) => {
    updateVideoState({ isLoaded })
  }, [updateVideoState])

  // Стабилизируем setEnded
  const setEnded = useCallback((isEnded: boolean) => {
    updateVideoState({ isEnded })
  }, [updateVideoState])
  
  // Стабилизируем setError
  const setError = useCallback((error: string) => {
    updateVideoState({ error })
  }, [updateVideoState])

  return {
    videoState,
    togglePlay,
    toggleMute,
    setCurrentTime,
    setDuration,
    setLoaded,
    setEnded,
    setError,
  }
}