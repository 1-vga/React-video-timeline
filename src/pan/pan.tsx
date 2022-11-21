import React, { FC, useEffect, useRef, useState } from 'react'
import { PAN_STEP } from '../constants';
import styles from './pan.module.css';

interface Props {
    isPlaying: boolean
}

const Pan: FC<Props> = ({isPlaying}) => {
  const panRef = useRef(null) as any;
  
  const [pan, setPan] = useState(0);
  const [intervalId, setIntervalId] = useState<ReturnType<typeof setTimeout> | null>(null) as any;
document
  useEffect(() => {
    if(isPlaying) {
      handlePanUpdate(pan);
    } else {
      console.log('cleared');PAN_STEP
      clearInterval(intervalId);
    }
  }, [isPlaying]);

  useEffect(() => {
    pan === 1000 && clearInterval(intervalId);
  }, [pan]);

  function handlePanUpdate(panValue: number) {
      let i = panValue;
      setIntervalId(
        setInterval(() => {
          i = i + PAN_STEP;
          setPan(i);
          panRef.current.style.left = `${i}px`;
        }, 1000)
      );
  }
 
  return (
    <div ref={panRef} className={styles.pan}>
        <div className={styles.panDisplay}>
          {panRef.current?.style.left || 0}
        </div>
    </div>
  )
}

export default Pan;