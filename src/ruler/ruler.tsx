import React, { useState, useEffect } from "react";
import { MIN_INTERVAL_NUMBER } from "../constants";
import { getRulerClearence } from "../utils";
import styles from './ruler.module.css';

function sec2time(timeInSeconds: number) {
    const pad = function(num: number, size: number) { return ('000' + num).slice(size * -1); }
    const time = parseFloat(String(timeInSeconds)).toFixed(3) as any;
    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = Math.floor(time - minutes * 60);
    const milliseconds = time.slice(-3);

    return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + pad(seconds, 2) + '.' + pad(milliseconds, 3);
}

  interface Props {
    zoom: number;
    duration: number;
  }

  const Ruler: React.FC<Props> = ({duration}) => {
    const [labels, setLabels] = useState<number[]>([]);

    useEffect(() => {
      const l = [];

      let interval = 0; 
      if(duration > 0 && duration < 3600) {//1 hour
        interval =  10
      } else if (duration >= 3600 && duration < 10800) {//3 hours
        interval = 20
      }

      for(let i = 0; i <= getRulerClearence(duration); i+=interval) {
        l.push(i);
      }

      setLabels(l);
    }, [duration]);

    const renderTimemarks = () => {
        return labels.length > 0 ?
        labels.map((mark, index) => {
          return <div key={index} className={styles.metricWrapper}>
            <div className={styles.metricDot}>
              <div className={styles.metricText}>
                {sec2time(mark)}
              </div>
            </div>
          </div>
        })
        : null;
    }

  return <section 
      id='timemetrics'
      className={styles.timeMetrics}
  >
  {
      renderTimemarks()
  }
  </section>
}

export default Ruler;