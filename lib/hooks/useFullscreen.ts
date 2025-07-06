import { useState, useCallback, useEffect, useRef, RefObject } from 'react'

// Расширяем интерфейс Document для поддержки префиксных методов
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element
  msFullscreenElement?: Element
  webkitExitFullscreen?: () => Promise<void>
  msExitFullscreen?: () => Promise<void>
}

// Расширяем интерфейс HTMLElement для поддержки префиксных методов
interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>
  msRequestFullscreen?: () => Promise<void>
}

export function useFullscreen(containerRef: RefObject<FullscreenElement>) {
  const lastExitTimeLimit = useRef(1200)
	const isExitFullscreen = useRef(false)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [isToggling, setIsToggling] = useState<boolean>(false)
  const [lastExitTime, setLastExitTime] = useState<number>(0)
  const [scrollPosition, setScrollPosition] = useState<number>(0)

	useEffect(() => {
		function isFirefox(): boolean {
		  return /Firefox\/\d+\.\d+/.test(navigator.userAgent);
		}
		function isOpera(): boolean {
		  return /(Opera|OPR)\/\d+\.\d+/.test(navigator.userAgent);
		}
		if (isFirefox() || isOpera()) {
			lastExitTimeLimit.current = 0
		}
	}, [])
  const handleFullscreenChange = useCallback(() => {
    const doc = document as FullscreenDocument
    const fullscreenElement =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.msFullscreenElement
    const newFullscreenState = !!fullscreenElement
    console.log('Fullscreen change detected:', { newFullscreenState, fullscreenElement })

    // Если обнаружен неожиданный вход в течение lastExitTimeLimit после выхода
    if (newFullscreenState && Date.now() - lastExitTime < lastExitTimeLimit.current) {
      console.log('Detected unwanted fullscreen re-entry, exiting...')
      const exitFullscreen =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.msExitFullscreen
      if (exitFullscreen) {
        exitFullscreen.call(doc).catch((error) => {
          console.error('Failed to exit unwanted fullscreen:', error)
        })
      }
      setIsFullscreen(false)
      setIsToggling(false)
      return
    }

    setIsFullscreen(newFullscreenState)
    setIsToggling(false)

    // Восстанавливаем позицию скролла после выхода
    if (!newFullscreenState && isExitFullscreen.current) {
      console.log('Restoring scroll position:', scrollPosition)
      window.scrollTo(0, scrollPosition)
      isExitFullscreen.current = false
    }
  }, [lastExitTime, scrollPosition])

  const attemptEnterFullscreen = useCallback(
    async (element: FullscreenElement, retries = 2, delay = 200): Promise<boolean> => {
      const requestFullscreen =
        element.requestFullscreen ||
        element.webkitRequestFullscreen ||
        element.msRequestFullscreen

      if (!requestFullscreen) {
        throw new Error('Fullscreen API is not supported')
      }

      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Attempting fullscreen entry, attempt ${attempt}`)
          await requestFullscreen.call(element)
          console.log('Fullscreen entered successfully')
          return true
        } catch (error) {
          console.error(`Fullscreen attempt ${attempt} failed:`, error)
          if (attempt === retries) {
            throw error
          }
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
      return false
    },
    []
  )

  const toggleFullscreen: () => Promise<void> = useCallback(async () => {
    if (!containerRef.current || isToggling) {
      console.warn(
        containerRef.current
          ? 'Fullscreen toggle is already in progress'
          : 'Container reference is not available'
      )
      return
    }

    const doc = document as FullscreenDocument
    setIsToggling(true)

    try {
      if (!isFullscreen) {
        // Сохраняем позицию скролла перед входом
        setScrollPosition(window.scrollY)
        // Удаляем класс no-interaction перед входом
        document.body.classList.remove('no-interaction')
        // Входим в полноэкранный режим
        await attemptEnterFullscreen(containerRef.current)
      } else {
        // Добавляем класс для запрета взаимодействия
        if (lastExitTimeLimit.current !== 0) {
	        document.body.classList.add('no-interaction')
	        setTimeout(() => {
	          document.body.classList.remove('no-interaction')
	        }, lastExitTimeLimit.current)
        }
        // Выходим из полноэкранного режима
        const exitFullscreen =
          doc.exitFullscreen ||
          doc.webkitExitFullscreen ||
          doc.msExitFullscreen

        if (exitFullscreen) {
        	isExitFullscreen.current = true
          await exitFullscreen.call(doc)
          setLastExitTime(Date.now())
        } else {
          throw new Error('Fullscreen exit API is not supported')
        }
      }
    } catch (error) {
      console.error(`Failed to toggle fullscreen:`, error)
      // Синхронизируем состояние при ошибке
      setIsFullscreen(false)
      setIsToggling(false)
      setLastExitTime(Date.now())
      document.body.classList.remove('no-interaction')
    }
  }, [isFullscreen, containerRef, attemptEnterFullscreen, isToggling])

  useEffect(() => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'msfullscreenchange',
      'selectionchange',
    ]

    const blockInteraction = (e: Event) => {
      if (!isFullscreen && Date.now() - lastExitTime < lastExitTimeLimit.current) {
        console.log(`${e.type} blocked after recent exit`)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleSelectionChange = () => {
      if (!isFullscreen && Date.now() - lastExitTime < lastExitTimeLimit.current) {
        console.log('Selection change detected after recent exit, clearing selection')
        window.getSelection()?.removeAllRanges()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, event === 'selectionchange' ? handleSelectionChange : handleFullscreenChange)
    })

    // Блокируем взаимодействие и долгое зажатие
    window.addEventListener('pointermove', blockInteraction, { passive: false })
    window.addEventListener('pointerdown', blockInteraction, { passive: false })
    window.addEventListener('click', blockInteraction, { passive: false })
    window.addEventListener('contextmenu', blockInteraction, { passive: false })

    // Проверяем начальное состояние
    console.log('Checking initial fullscreen state')
    handleFullscreenChange()

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, event === 'selectionchange' ? handleSelectionChange : handleFullscreenChange)
      })
      window.removeEventListener('touchstart', blockInteraction)
      window.removeEventListener('touchend', blockInteraction)
      window.removeEventListener('click', blockInteraction)
      window.removeEventListener('contextmenu', blockInteraction)
      document.body.classList.remove('no-interaction')
    }
  }, [handleFullscreenChange, isFullscreen, lastExitTime])

  return { isFullscreen, toggleFullscreen }
}