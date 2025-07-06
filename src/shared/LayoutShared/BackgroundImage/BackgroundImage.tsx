'use client'
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface ImageObject {
	imgUrl: string
	altText: string
}
interface BackgroundImageProps {
	mobile: ImageObject
	desktop: ImageObject
}

const BackgroundImage = ({ mobile, desktop }: BackgroundImageProps) => {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [altText, setAltText] = useState<string>('')
  
  useEffect(() => {
  	
    // Медиа-запрос
    const mediaQuery = window.matchMedia('(min-width: 1080px) and (min-aspect-ratio: 4/6)');
		const checkMedia = (matches: boolean) => {
			if (matches) {
				setImageSrc(desktop.imgUrl)
				setAltText(desktop.altText)
			} else {
				setImageSrc(mobile.imgUrl)
				setAltText(mobile.altText)
			}
		}
    // Функция для обработки изменений
    const handleMediaQueryChange = (event: MediaQueryListEvent) => {
      checkMedia(event.matches);
    };
    // Устанавливаем начальное значение
    checkMedia(mediaQuery.matches);
    // Добавляем слушатель
    mediaQuery.addEventListener('change', handleMediaQueryChange);
    // Очистка при размонтировании
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, [mobile, desktop]);

  return (
    <div className={`${styles.backgroundWrap} ${imageSrc ? styles.visible : ''}`}>
      <img 
        className={styles.background} 
        src={imageSrc} alt={altText}
      />
    </div>
  );
};

export default BackgroundImage;