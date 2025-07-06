"use client"
import { memo } from 'react'
import Image from 'next/image'
import styles from './styles.module.css'
// https://www.freepik.com/icon/silent_3293592#fromView=search&page=1&position=17&uuid=24d97de8-76e4-436d-82bf-379303d43706
interface MuteButtonProps {
  isMute: boolean
  toggleMute: () => void
}

function MuteButton({isMute, toggleMute}: MuteButtonProps) {
	
	return (
		<button 
		  onClick={toggleMute}
		  className={`${styles.muteBtn} ${!isMute ? styles.active : ''}`}
		>
		  {!isMute ? (
		     <Image className={styles.muteBtnLogo} src='/icon/volume.webp' fill={true} alt=''/>
		    ) : (
		     <Image className={styles.muteBtnLogo} src='/icon/silent.webp' fill={true} alt=''/>
		    )
		  }
		</button>
	)
}
export default memo(MuteButton)