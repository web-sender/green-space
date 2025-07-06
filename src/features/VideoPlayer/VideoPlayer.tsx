'use client'
import { 
	memo, useEffect, useRef,
	Dispatch, SetStateAction
} from 'react'
import styles from './styles.module.css'
import VideoElement from './children/VideoElement'
import { useVideoState, IVideoState } from '@/hooks/useVideoState'

interface IMessage {
	action: string
	data?: string | number
}
interface IVideoData {
	url: string
	type: string
}
interface IBeforeSide extends IVideoState {
	togglePlay: () => void
}
interface IVideoHookState {
	videoState: IVideoState
	togglePlay: () => void
	toggleMute: () => void
	setEnded: (isEnded: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setLoaded: (isLoaded: boolean) => void
  setError: (error: string) => void
}
interface VideoPlayerProps {
  id: number
  videoData: IVideoData
  message: IMessage | null
  setState: Dispatch<SetStateAction<IBeforeSide | null>> | null
  sendLoaded: (isLoaded: boolean) => void
  clearMessage: () => void
}
function VideoPlayer({
  videoData,
  message,
  setState,
  sendLoaded,
  clearMessage
}: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null)
	const { videoState, togglePlay, ...controller }: IVideoHookState = useVideoState(videoRef)

	// Наблюдаем за появлением канала связи с VideoControll
	useEffect(() => {
		// Получаем сигнал о начале общения с VideoControll и выполняем синхронизацию
	  if (setState) setState({ ...videoState, togglePlay })
	}, [setState, videoState, togglePlay])
	
	// Ждем уведомлений для выполнения нового задания (через соответствующий обработчик)
	useEffect(() => {
	  // Не допускаем обработку сообщений в момент загрузки видео или при отсутствии сообщения
	  if (!message || !videoState.isLoaded) return;
	
	  // Функция для обработки действия с валидацией типа data
	  const handleAction = (action: keyof typeof controller, data?: string | number | boolean) => {
	    switch (action) {
	      case 'toggleMute':
	        controller.toggleMute()
	        break;
	      case 'setCurrentTime':
	        if (typeof data === 'number') {
	          if (data < videoState.duration) {
	          	controller.setEnded(false)
	          	if (data === 0) { togglePlay() }
	          }
	          controller.setCurrentTime(data)
	          if (videoRef.current) {
	            videoRef.current.currentTime = data
	          }
	        }
	        break;
	      case 'setDuration':
	        if (typeof data === 'number') {
	          controller.setDuration(data)
	        }
	        break;
	      case 'setLoaded':
	        if (typeof data === 'boolean') {
	          controller.setLoaded(data)
	        }
	        break;
	      case 'setError':
	        if (typeof data === 'string') {
	          controller.setError(data)
	        }
	        break;
	      default:
	        return;
	    }
	    clearMessage()
	  }
	
	  // Проверяем, что action является валидным ключом controller
	  if (message.action in controller) {
	    handleAction(message.action as keyof typeof controller, message.data);
	  }
	}, [message, videoState.isLoaded, videoState.duration, clearMessage, togglePlay, controller, videoRef]);
	
	
	const onLoadedMetadata = (duration: number) => {
    if (videoRef.current) {
	    controller.setDuration( duration )
	    controller.setLoaded(true)
	    sendLoaded(true)
    }
  }
  
	const onError = (error: Error) => {
    controller.setError(`Video error: ${error.message}`)
    controller.setLoaded(false)
  }
  
	const onTimeUpdate = (time: number) => {
		controller.setCurrentTime( time )
  }
  
  const onEnded = () => {
  	if (videoState.isPlaying) {
  	  togglePlay()
  	}
  	controller.setEnded(true)
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.videoWrap}>
	      <VideoElement
	        ref={videoRef}
	        url={videoData.url}
	        type={videoData.type}
	        isMute={videoState.isMute}
	        onTimeUpdate={onTimeUpdate}
	        onLoadedMetadata={onLoadedMetadata}
	        onError={onError}
	        onPlaying={togglePlay}
	        onEnded={onEnded}
	      />
      </div>
    </div>
  )
}
	      //<p style={{color: 'red'}}>{videoState.isEnded ? 'end' : 'playing'}</p>

export default memo(VideoPlayer)