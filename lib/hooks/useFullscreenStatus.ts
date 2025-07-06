import { useEffect, useState, useCallback } from 'react';

// Расширяем интерфейс Document
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
}

type FullscreenTransition = 'enter' | 'exit' | null;

interface FullscreenState {
  isFullscreen: boolean;
  transition: FullscreenTransition;
}

/**
 * useFullscreenStatus — хук для отслеживания полноэкранного режима.
 *
 * @returns Объект с текущим состоянием (isFullscreen) и типом перехода (transition).
 */
export function useFullscreenStatus(): FullscreenState {
  const [fullscreenState, setFullscreenState] = useState<FullscreenState>({
    isFullscreen: false,
    transition: null,
  });
  const [prevIsFullscreen, setPrevIsFullscreen] = useState<boolean | null>(null);

  const handleFullscreenChange = useCallback(() => {
    const doc = document as FullscreenDocument;
    const isFullscreen = Boolean(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    // Определяем тип перехода
    let transition: FullscreenTransition = null;
    if (prevIsFullscreen !== null) {
      if (!prevIsFullscreen && isFullscreen) {
        transition = 'enter';
      } else if (prevIsFullscreen && !isFullscreen) {
        transition = 'exit';
      }
    }

    // Обновляем состояние
    setFullscreenState({ isFullscreen, transition });
    setPrevIsFullscreen(isFullscreen);
  }, [prevIsFullscreen]);

  useEffect(() => {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    events.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange);
    });

    // Вызываем сразу при монтировании
    handleFullscreenChange();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [handleFullscreenChange]);

  return fullscreenState;
}