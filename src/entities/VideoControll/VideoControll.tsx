import { 
	useState, useEffect, memo, 
	Dispatch, SetStateAction 
} from 'react'
import PlayButton from '@/shared--video/PlayButton/PlayButton'
import MuteButton from '@/shared--video/MuteButton/MuteButton'
import SeekBar from '@/shared--video/SeekBar/SeekBar'
import FullscreenButton from '@/shared--video/FullscreenButton/FullscreenButton'
import { IVideoState } from '@/hooks/useVideoState'
import styles from './styles.module.css'


interface ArrowProps {
	direction: 'left' | 'right'
}
function Arrow({direction}: ArrowProps) {
	
	return (<div className={`${styles.arrow} ${direction === 'left' ? styles.toLeft : styles.toRight}`}>
		<span className={styles.arrowCore}></span>
	</div>)
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

interface IMessage {
	action: string
	data?: string | number
}

interface IBeforeSide extends IVideoState {
	togglePlay: () => void
}

interface VideoControllProps {
	setMessage: (message: IMessage) => void
	beforeSide: IBeforeSide | null
	isVideoLoaded: boolean[]
	setStopDragging: Dispatch<SetStateAction<boolean>>
	isAnimate: boolean
	toLeft: () => void
	toRight: () => void
	isFullscreen: boolean
	toggleFullscreen: () => Promise<void>
}
function VideoControll({ 
	setMessage, beforeSide,
	isVideoLoaded,
	setStopDragging, 
	isAnimate, toLeft, toRight, 
	isFullscreen, toggleFullscreen
}: VideoControllProps) {
	const [isLoaded, setLoaded] = useState(false)
	
	useEffect(() => {
	  const res = isVideoLoaded.reduce((res, loaded) => loaded ? res : false, true)
	  if (res) setLoaded(res)
	}, [isVideoLoaded])
	
  const onSeek = (time: number): void => {
	  setMessage({ action: 'setCurrentTime', data: time })
  }
  const onMute = (): void => {
	  setMessage({ action: 'toggleMute' })
  }
  const onPlaying = (): void => {
	  setMessage({ action: 'togglePlay' })
  }
  const onEnded = (): void => {
		setMessage({ action: 'setCurrentTime', data: 0 })
  }
  
  const onPlayClick = () => {
  	if (!beforeSide) {
			onPlaying(); return;
  	}
		if (beforeSide.isEnded) {
			onEnded(); return;
		}
		beforeSide.togglePlay()
  }

  return (<div className={`${styles.cubeControll} ${isFullscreen ? styles.fullscreen : ''}`}>
  	<button
			className={`btn ${styles.btnControll} ${isAnimate ? styles.disabled : ''}`}
			onClick={toLeft} disabled={isAnimate}
		> <Arrow direction={'left'}/> </button>
		
		<div className={styles.controllInner}>
			<div className={styles.controllPart}>
				<div className={styles.controllTime}>
					<span className={styles.timeDisplay}>
						{ beforeSide ? formatTime( beforeSide.currentTime ) : '0:00' }
					</span>
					<SeekBar 
						currentTime={beforeSide ? beforeSide.currentTime : 0}
					  duration={beforeSide ? beforeSide.duration : 0}
					  onSeek={onSeek}
					  setStopDragging={setStopDragging}
					/>
					<span className={styles.timeDisplay}>
						{ beforeSide ? formatTime( beforeSide.duration ) : '0:00' }
					</span>
				</div>
			</div>
			
			<div className={styles.controllPart}>
				<div className={styles.controllList}>
					<MuteButton
						isMute={beforeSide ? beforeSide.isMute : false}
						toggleMute={onMute}
					/>
					
					<PlayButton
						isPlaying={beforeSide ? beforeSide.isPlaying : false}
						isLoaded={isLoaded}
						isFullscreen={isFullscreen}
						togglePlay={onPlayClick}
					/>
					
					<FullscreenButton
						isFullscreen={isFullscreen}
						toggleFullscreen={toggleFullscreen}
					/>
				</div>
			</div>
		</div>
		
		<button 
			className={`btn ${styles.btnControll} ${isAnimate ? styles.disabled : ''}`}
			onClick={toRight} disabled={isAnimate}
		> <Arrow direction={'right'}/> </button>
  </div>)
}

export default memo(VideoControll)


