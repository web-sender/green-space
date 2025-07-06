'use client'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import layoutData from '@/data/layoutData.json'
import styles from "./styles/notFound.module.css";

interface IAct {
	type: string
	text: string
	prompt: string
	url?: string
}

function NotFound() {
	const router = useRouter()
	const notFoundRef = useRef(null)
	
	useIntersectionObserver(notFoundRef, styles.visible, {once: false, threshold: .1})
	
	const onBack = () => {
		router.back()
	}
	const toPage = (url: string) => {
		router.push(url)
	}
	
	function getActionHandler(act: IAct): () => void {
		switch (act.type) {
			case 'back':
				return onBack;
			case 'push':
				return () => toPage(act.url || '/');
			default: 
			  return onBack;
		}
	}
	
  return (
    <div 
  	  ref={notFoundRef}
      className={styles.notFound}
    >
      <div className={styles.notFoundContainer}>
      	<div className={styles.wrapCodeError}>
      		<div className={styles.codeError}>
      			404
      		</div>
      	</div>
      	<div className={styles.actionList}>
      		{layoutData.notFound.actions.map(
      		  (act, index) => (
      		    <div 
      		      className={`${styles.wrapAct}`} key={index}
      		      onClick={getActionHandler(act)}
      		    >
			      		<div className={styles.actMassage}>{act.text}</div>
	      		    <button 
	      		      className={`btn ${styles.actBtn}`}
			      		>{act.prompt}</button>
	      		  </div>
	      		)
      		)}
      	</div>
      </div>
    </div>
  )
}

export default NotFound;
