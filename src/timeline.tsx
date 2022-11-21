import React, { useEffect, useMemo, useRef } from 'react';
import type { FC } from 'react'
import { useCallback, useState } from 'react'
import { Clip } from './clip';
import { Container } from './Container'
import { CustomDragLayer } from './CustomDragLayer'
import { RULER_CLEARANCE, MIN_RULER_WIDTH_PX, snapToGridWhileDragging, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM, ROW_HEIGHT, MIN_RULER_WIDTH_SECONDS } from './constants';
import { Ruler } from './ruler';
import { Pan } from './pan';

export const Timeline: FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [zoom, setZoom] = useState(1);
  const [longestRowDuration, setLongestRowDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const zoomIn = () => {
    zoom !== MAX_ZOOM && setZoom((prev) => prev * ZOOM_STEP);
  }

  const zoomOut = () => {
    zoom !== MIN_ZOOM && setZoom((prev) => prev / ZOOM_STEP);
  }

  const handleChange = () => {
    return async (e: any) => {
      const isFile = e.target.files && e.target.files?.length! > 0 && e.target.files?.[0]?.type.includes("video");
      if (isFile) {
        const rowIndex = Number(e.target.name);

        const c = new Clip(
          e.target.files[0],
          0,
          rowIndex * ROW_HEIGHT,
          80,
          zoom,
          0,
          rowIndex
        );
          
        const row = clips.filter(clip => clip.top === (rowIndex * ROW_HEIGHT));

        const maxLeft = row?.reduce((acc, next) => acc.left > next.left ? acc : next, row[0]); // | 0
        c.left = maxLeft ? maxLeft.right : 0;
        await c.ready;
        c.startTime = maxLeft ? maxLeft.duration : 0;
        setClips([...clips, c]);
      }
    }
  }

  const Width = useRef(null) as any;

  const rulerDuration = useMemo(() => {
    const rowsObject = clips.reduce((acc: {[key: string]: number}, next) => {
      if(acc[next.rowIndex]) {
        acc[next.rowIndex] += next.duration;
        return acc;
      } else {
        acc[next.rowIndex] = next.duration;
        return acc;
      }
    }, {});

    const longestRowDuration = Math.max(...Object.values(rowsObject));
    setLongestRowDuration(longestRowDuration);
    const longestRowIndex = Object.keys(rowsObject).find((key: string) => rowsObject[key] === longestRowDuration);
    const rowClips = clips.filter(clip => clip.rowIndex === Number(longestRowIndex));
    const lastElement = rowClips.reduce((acc, next) => acc.left > next.left ? acc : next, rowClips[0]);

    const clipEnd = lastElement?.startTime + lastElement?.duration;

    const minClearance = MIN_RULER_WIDTH_SECONDS - (MIN_RULER_WIDTH_SECONDS / 100 * RULER_CLEARANCE); //25% to initialRulerLength
    const maxClearance = clipEnd; //25 % to rulerLength

    let clearance = clipEnd < MIN_RULER_WIDTH_SECONDS ? minClearance : maxClearance;
    
    // console.log(clipEnd, minRulerClearance, clipEnd >= minRulerClearance);
    if(clipEnd >= clearance) {

      const increasedRulerDuration = clipEnd + (clipEnd / 100 * RULER_CLEARANCE); //25% more duration

      let w = Number(Width.current.style.width.split('px')[0]);
      // const increasedRulerWidth = (w / 100 * RULER_CLEARANCE);
      // clips.forEach(clip => clip.minRulerWidthPx = increasedRulerWidth);
      // Width.current.style.width = w + increasedRulerWidth + 'px';
      console.log('clipEnd2', lastElement?.startTime, clipEnd);
      // zoomIn();
      return increasedRulerDuration;
    } else {
      console.log('clipEnd1', lastElement?.startTime, clipEnd);
      return clipEnd | 1;
    }
   // return  (lastElement?.startTime + lastElement?.duration) | 1;

  }, [clips]);

  const width = useMemo(() => {
    if(longestRowDuration < MIN_RULER_WIDTH_SECONDS) {
      return MIN_RULER_WIDTH_PX * zoom;
    } else {
      const width = longestRowDuration * MIN_RULER_WIDTH_PX / MIN_RULER_WIDTH_SECONDS * zoom;
      const widthWithClearance = width + (width / 100 * RULER_CLEARANCE);

      return widthWithClearance; 
    }
  }, [longestRowDuration, zoom]);


  

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  }

  return (
    <div ref={Width} style={{width: width + 'px'}}> 
      <div>
        <button onClick={zoomIn}>+</button>
        <button onClick={zoomOut}>-</button>
        <span>Zoom: {zoom}</span>
      </div>
      <div>
        <button onClick={handlePlay}>Play/Pause</button>
      </div>
      <div>
        <label htmlFor="file1">add1</label>
        <input id='file1' type={"file"} name={'1'} onChange={handleChange()} accept="video/*" />
        <label htmlFor="file1">add2</label>
        <input id='file2' type={"file"} name={'2'} onChange={handleChange()} accept="video/*" />
      </div>
      <Ruler zoom={zoom} duration={rulerDuration}/>
      <Container zoom={zoom} clips={clips} setClips={setClips}/>
      <CustomDragLayer snapToGrid={snapToGridWhileDragging} clips={clips} />
      <Pan isPlaying={isPlaying}/>
    </div>
  )
};
