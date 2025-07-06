"use client"
import { 
	useState, useEffect, useRef,
	Dispatch, SetStateAction
} from 'react'
import { PointerEvent } from 'react'
import VideoPlayer from '@/features/VideoPlayer/VideoPlayer'
import VideoControll from '@/entities/VideoControll/VideoControll'
import animateRotation from './helper/animateRotation'
import { getTransformStr } from './helper/manageSize'
import { useFullscreen } from '@/hooks/useFullscreen'
import {
	findStartingAngle, getPositionSides, calculateSectorOverlap, createGradient,
	ISector, IOverlapResult
} from './helper/shadowHelper'
import { IVideoState } from '@/hooks/useVideoState'
import styles from './styles.module.css'

interface IBeforeSide extends IVideoState {
	togglePlay: () => void
}
interface IMessage {
	action: string
	data?: string | number
}
interface INote {
	id: number
	message: IMessage | null
	setState: Dispatch<SetStateAction<IBeforeSide | null>> | null
}

interface IVideo {
	url: string
	type: string
}
interface Props {
	videoList: IVideo[]
}

function VideoCube({ videoList }: Props) {
	const cubeRef = useRef<HTMLDivElement>(null)
	const sceneRef = useRef<HTMLDivElement>(null)
	const sidesCube = useRef<HTMLDivElement[]>([])
	
	const [transformList, setTransformList] = useState<string[]>(
		new Array(videoList.length).fill('')
	)
	// При достижении загрузки видео всеми строронами - VideoControll оповещает пользователя про готовность к просмотру
	const [isVideoLoaded, setVideoLoaded] = useState<boolean[]>(
		new Array(videoList.length).fill(false)
	)

	const [isDragging, setIsDragging] = useState(false)
	const [stopDragging, setStopDragging] = useState(false)
	const [startX, setStartX] = useState(0)
	const [startY, setStartY] = useState(0)

	const [rotX, setRotX] = useState(7)
	const [rotY, setRotY] = useState(-35)
	const [cornerPointsCube, setCornerPointsCube] = useState<ISector[]>([])

	const [isAnimate, setAnimate] = useState(false)
	const animationFrame = useRef(null)

	const { isFullscreen, toggleFullscreen } = useFullscreen(sceneRef)

	const [beforeSideOrdinal, setBeforeSideOrdinal] = useState<number>(0)
	const [beforeSide, setBeforeSide] = useState<IBeforeSide | null>(null)
	
	const [notes, setNotes] = useState<INote[]>(
		Array.from({ length: videoList.length }, 
		  (_, index) => ({ id: index, message: null, setState: null })
		)
	)

	// Позиционируем стороны куба в перпективе через translateZ,
	// при изменении размеров экрана и первом рендере
	useEffect(() => {
		if (videoList.length === 0) return;
		
		function updateSize() {
			if (!sidesCube.current || !(sidesCube.current.length > 0)) return;
			const firstSide = sidesCube.current[0]

			const newSideWidth = parseFloat( window.getComputedStyle(firstSide).width )
			if (!newSideWidth || isNaN( newSideWidth )) return;
			
			const newTransformList = videoList.map((_, index) => (
				getTransformStr(index, newSideWidth, videoList.length)
			))
			setTransformList( newTransformList )
		}
		// Сохраняем значение animationFrame.current для предотвращения потери доступа
		const currentAnimationFrame = animationFrame.current

		updateSize()
		window.addEventListener('resize', updateSize)

		return () => {
			if (currentAnimationFrame) {
				cancelAnimationFrame(currentAnimationFrame)
			}
			window.removeEventListener('resize', updateSize)
		}
	}, [videoList])
	
	// Предотвращение прокрутки во время вращения куба
	useEffect(() => {
		// Сохраняем значение sceneRef.current в переменную
		const currentScene = sceneRef.current

		const preventScroll = (e: Event) => {
			if (isDragging) {
				e.preventDefault()
			}
		}

		if (currentScene) {
			currentScene.addEventListener('touchmove', preventScroll, { passive: false })
			currentScene.addEventListener('wheel', preventScroll, { passive: false })
		}

		return () => {
			if (currentScene) {
				currentScene.removeEventListener('touchmove', preventScroll)
				currentScene.removeEventListener('wheel', preventScroll)
			}
		}
	}, [isDragging])

	// Обработка прокрутки куба
	const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
		setIsDragging(true)
		setStartX(e.clientX)
		setStartY(e.clientY)
		if (sceneRef.current) {
			sceneRef.current.style.cursor = 'grabbing'
		}
	}
	const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
		if (!isDragging || stopDragging) return;

		const deltaX = e.clientX - startX
		const deltaY = e.clientY - startY
		setRotY((prev) => prev + deltaX * 0.5)
		setRotX((prev) => prev - deltaY * 0.5)
		setStartX(e.clientX)
		setStartY(e.clientY)
	}
	const handlePointerUp = () => {
		setIsDragging(false)
		if (sceneRef.current) {
			sceneRef.current.style.cursor = 'grab'
		}
	}

  // Изменяем трансформацию куба реагируя на [rotX, rotY]
  // Также расчитываем относительную позицию его сторон
	useEffect(() => {
		if (cubeRef.current) {
			cubeRef.current.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`
		}
		const startPoint = Math.floor(findStartingAngle(rotY))

		try {
			const positionsSides = getPositionSides(startPoint, videoList.length)
			setCornerPointsCube(positionsSides)
		} catch (error) {
			console.warn(error)
		}
	}, [rotX, rotY, videoList])
	
	// Управляем поведением теней при вращении куба
	useEffect(() => {
		if (!sidesCube.current || cornerPointsCube.length <= 0) return
		// Задняя часть куба относительно пользователя
		const darkSideSector = { start: 90, end: 270, size: 180 }

		const changeShadowCube = () => {
			const overlapDarkSector = cornerPointsCube.map((cornerPoint) => calculateSectorOverlap(darkSideSector, cornerPoint))

			overlapDarkSector.map((sideSector, index) => {
				if (!sidesCube.current[index]) return;
				const value = createGradient(sideSector, '#000')

				sidesCube.current[index].style.backgroundImage = value
				return value
			})
		}

		requestAnimationFrame(changeShadowCube)
	}, [cornerPointsCube])
	
	// Настраиваем VideoControll на общение со сторонной перед пользователем
	useEffect(() => {
		if (!sidesCube.current || cornerPointsCube.length <= 0) return
		// Определяем сектор (область перед пользователем) для наиболее видимой стороны
		const beforeSideSector = { start: 315, end: 45, size: 90 }
		
		// Находим наиболее видимую сторону к пользователю (если куб не перевёрнут по X)
		const overlapBeforeSector: IOverlapResult[] = cornerPointsCube.map((cornerPoint) => calculateSectorOverlap(beforeSideSector, cornerPoint))
		// Получаем эту сторону, сохраняя её порядковый индекс: [индекс, сторона]
		const newBeforeSide = overlapBeforeSector.reduce<[number, IOverlapResult] | null>(
		  // Начальное значение — кортеж [индекс, сторона] или null
		  (prevSide, sideSector, index) => {
		    // Если prevSide — null, возвращаем текущий индекс и sideSector
		    if (!prevSide) {
		      return [index, sideSector];
		    }
		    // Сравниваем overlapPercentage и возвращаем сторону с большим значением
		    return prevSide[1].overlapPercentage > sideSector.overlapPercentage
		      ? prevSide
		      : [index, sideSector];
		  },
		  null // Начальное значение
		);
		if (!newBeforeSide) return;
		
		// Сохраняем порядковый индекс
		setBeforeSideOrdinal( newBeforeSide[0] )
		// Устанавливаем канал общения между VideoControll и наиболее видимой стороной
		setNotes(prev => prev.map(
			(note, index) => {
				if (note.setState) {
					// Удаляем канал общения для предыдущей наиболее видимой стороны
					const clearedNote = { ...note, setState: null }
					return index === newBeforeSide[0] ? { ...clearedNote, setState: setBeforeSide } : clearedNote
				}
				return index === newBeforeSide[0] ? { ...note, setState: setBeforeSide } : note
			}
		))

	}, [cornerPointsCube])
	
	// Это инструмент VideoControll для передачи сообщений ближайшей стороне к пользователю
	function setNoteMessage(message: IMessage) {
		setNotes(prev => prev.map(
			(note, index) => (
				index === beforeSideOrdinal ? { ...note, message } : note
			)
		))
	}
	const clearMessage = (target: number): () => void => {
		return () => {
			setNotes(prev => prev.map(
				(note, index) => (
					index === target ? { ...note, message: null } : note
				)
		  ))
		}
	}

  // Вызывает animateRotation для поворота куба к предыдущей стороне
	const toLeft = (): void => {
		animateRotation('forward',
			rotY, setRotY, rotX, setRotX,
			animationFrame, setAnimate
		)
	}
  // Вызывает animateRotation для поворота куба к следующей стороне
	const toRight = (): void => {
		animateRotation('backward',
			rotY, setRotY, rotX, setRotX,
			animationFrame, setAnimate
		)
	}
	
	// Для оповещения стороной куба что её видео было загружено
	const sendLoaded = (target: number): (isLoaded: boolean) => void => {
		return (isLoaded: boolean) => {
			setVideoLoaded(prev => prev.map(
				(_, index) => index === target ? isLoaded : _
			))
		}
	}

	return (
		<div ref={sceneRef} className={styles.scene} >
			<div
				className={styles.cubeWrap}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerUp}
			>
				<div ref={cubeRef} className={styles.cube} >
					{
						videoList.map((data, index) => (
							<div
								ref={(el) => { if (el) sidesCube.current[index] = el }}
								className={`${styles.face}`}
								style={{ transform: transformList[index] }} 
								key={index}
							>
								<VideoPlayer
									id={ notes[index].id }
									message={ notes[index].message }
									setState={ notes[index].setState }
									videoData={ videoList[index] }
									sendLoaded={ sendLoaded(index) }
									clearMessage={ clearMessage(index) }
								/>
							</div>
					  ))
					}
				</div>
			</div>

			<div className={styles.cubeControll}>
				<VideoControll
					beforeSide={beforeSide}
					setMessage={setNoteMessage}
					isVideoLoaded={isVideoLoaded}
					setStopDragging={setStopDragging}
					isAnimate={isAnimate}
					toLeft={toLeft}
					toRight={toRight}
					isFullscreen={isFullscreen}
					toggleFullscreen={toggleFullscreen}
				/>
			</div>
		</div>
	)
}

export default VideoCube