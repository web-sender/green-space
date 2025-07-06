'use client'
import React, { memo } from 'react'
import styles from '../styles.module.css'

interface IStat {
  value: string
  description: string
}

interface StatProps {
  stat: IStat
  key: string | number
}
function Stat({stat}: StatProps) {
  return (<li className={styles.statItem}>
    <div className={styles.accent}>
      {stat.value}
    </div>
    <div className={styles.description}>
      {stat.description}
    </div>
  </li>)
}

interface StatsListProps {
  stats: IStat[]
}
function StatsList({ stats }: StatsListProps) {
  return (
    <ul className={styles.statList}>
      {stats.map((stat, index) => (
        <Stat stat={stat} key={index}/>
      ))}
    </ul>
  )
}

export default memo(StatsList);