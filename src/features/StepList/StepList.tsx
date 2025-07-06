'use client'
import { useRef, memo } from 'react'
import useIntersectionObserver from '@/hooks/useIntersectionObserver'
import styles from './styles.module.css';

interface IStep {
  number: number;
  title: string;
  description: string;
}

interface StepItemProps {
	step: IStep
	index: number
	key: number | string
}

const StepItem = ({step, index}: StepItemProps) => {
	const stepRef = useRef(null)
	
	useIntersectionObserver(stepRef, styles.visible, {once: false, threshold: 1})
	
	return (
		<div
		  ref={stepRef}
      className={`
        ${styles.stepCard}
        ${index % 2 === 0 ? styles.leftAlign : styles.rightAlign}
      `}
    >
      <div className={styles.cardMain}>
        <div className={styles.cardInner}>
          <span className="index">{step.number}</span>
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={`description ${styles.stepDescription}`}>{step.description}</p>
          </div>
        </div>
      </div>
    </div>
	)
}
const MemoizedStepItem = memo( StepItem );

interface StepListProps {
	steps: IStep[]
}

const StepList = ({ steps }: StepListProps) => {

	return (
		<div className={styles.stepsContainer}>
      {steps.map((step, index) => (
        <MemoizedStepItem 
          step={step} index={index} key={index}
        />
      ))}
    </div>
	)
}

export default memo(StepList);


