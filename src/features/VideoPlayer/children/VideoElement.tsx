'use client'
import React, { forwardRef, useState, useEffect, useRef } from 'react'
import { preciseTimeout } from '@/helpers/timeHelper'
import styles from '../styles.module.css'

interface VideoElementProps {
  url: string
  type: string
  isMute: boolean
  onTimeUpdate: (time: number) => void
  onLoadedMetadata: (duration: number) => void
  onError: (error: Error) => void
  onPlaying: () => void
  onEnded: () => void
}

/**
 * Захватывает кадр из видео на указанном времени и возвращает его в формате PNG или WebP.
 * @param video HTMLVideoElement для захвата кадра
 * @param canvas HTMLCanvasElement для рендеринга кадра
 * @param outputFormat Формат изображения ('image/png' или 'image/webp')
 * @param timeOffset Время в секундах для захвата кадра (по умолчанию 1 секунда)
 * @returns Promise, разрешающийся с URL данных изображения
 */
const captureFrame = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  outputFormat: 'image/png' | 'image/webp' = 'image/png',
  timeOffset: number = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Проверяем, что видео готово к воспроизведению
    if (video.readyState < 2) {
      reject(new Error('Видео еще не готово для захвата кадра'));
      return;
    }

    const context = canvas.getContext('2d');
    if (!context || video.videoWidth <= 0 || video.videoHeight <= 0) {
      reject(new Error('Невозможно получить контекст canvas или размеры видео'));
      return;
    }

    // Устанавливаем размеры canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Перемещаем видео ко второму кадру (или указанному времени)
    video.currentTime = timeOffset;

    // Ждем, пока видео дойдет до нужного времени
    const onSeeked = () => {
      try {
        // Рисуем кадр на canvas
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        // Получаем данные в указанном формате
        const dataUrl = canvas.toDataURL(outputFormat, 1.0);
        resolve(dataUrl);

        // Удаляем canvas из DOM
        canvas.remove();
      } catch (error) {
        reject(new Error(`Ошибка при захвате кадра: ${(error as Error).message}`));
      }
    };

    // Обрабатываем ошибку при перемотке
    const onError = () => {
      reject(new Error('Ошибка при перемотке видео'));
    };

    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
  });
};

const VideoElement = forwardRef<HTMLVideoElement, VideoElementProps>(
  ({ url, type, isMute, onTimeUpdate, onLoadedMetadata, onError, onPlaying, onEnded }
, videoRef) => {
		const canvasRef = useRef<HTMLCanvasElement>(null)
		const [poster, setPoster] = useState<string>('')
		const isPoster = useRef(false)

    useEffect(() => {
      const video = videoRef && 'current' in videoRef ? videoRef.current : null;
      const canvas = canvasRef.current
      if (!video || !canvas) return;
      
      const captureAndSetPoster = async (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
			  try {
			    const dataUrl = await captureFrame(video, canvas);
			    setPoster(dataUrl);
			    isPoster.current = true;
			  } catch (error) {
			    console.error(error);
			  }
			}
      
      const handleError = () => {
        onError(new Error('Failed to load video'))
      }
      video.addEventListener('error', handleError)
      
      preciseTimeout(() => {
      	if (!isNaN(video.duration) && video.duration > 0) {
          onLoadedMetadata(video.duration)
        }
        if (!isPoster.current) { 
        	captureAndSetPoster(video, canvas)
        }
      }, 500)
      
      return () => {
        video.removeEventListener('error', handleError)
      }
    }, [videoRef, onError, onLoadedMetadata])
    
    const handleTimeUpdate = () => {
		  if (videoRef && 'current' in videoRef && videoRef.current) {
		    onTimeUpdate(videoRef.current.currentTime)
		  }
		}
		const handlePlaying = () => {
			setPoster('')
		}

    return (<div>
      <video 
        ref={videoRef} 
        className={`${styles.video} ${(poster || isPoster.current) ? styles.visible : ''}`} 
        preload="auto" 
        poster={poster}
        controls={false} 
        muted={isMute}
        onPlaying={handlePlaying}
        onClick={onPlaying}
        onTimeUpdate={handleTimeUpdate}
        onEnded={onEnded}
      >
        <source src={url} type={type} />
      </video>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
		</div>)
  }
)

VideoElement.displayName = 'VideoElement'

export default VideoElement