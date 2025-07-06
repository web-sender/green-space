'use client'
import { useRef } from 'react';
import Image from 'next/image'
import Link from 'next/link'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import styles from './styles.module.css';

interface PropsPreviewCard {
  img: {
    url: string
    alt: string
  }
  link: {
    url: string
    text: string
  };
}

export default function PreviewCard({img, link}: PropsPreviewCard) {
  const cardRef = useRef(null)
  
  useIntersectionObserver(cardRef, styles.visible, {once: false, threshold: 1})

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.cardInner}>
      	<div className={styles.cardImgWrap}>
	        <div className={`${styles.cardImgContainer} imgContainer`}>
	          <Image
             className={`${styles.cardImg} img`}
             src={img.url} fill={true} alt={img.alt}
	          />
	        </div>
      	</div>
        <div className={styles.cardBtn}>
          <Link className='btn'
            href={link.url}>{link.text}</Link>
        </div>
      </div>
    </div>
  );
}