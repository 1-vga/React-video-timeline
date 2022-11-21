import update from 'immutability-helper'
import { CSSProperties, FC, useEffect } from 'react'
import { useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { MediaClip } from './media-clip';
import type { DragItem } from './interfaces'
import { ItemTypes } from './ItemTypes'
import { Clip } from './clip';
import { areRectanglesOverlapped } from './utils';

const styles: CSSProperties = {
  height: 400,
  border: '1px solid black',
  position: 'relative',
}
 
export interface ContainerProps {
  zoom: number;
  clips: Clip[];
  setClips: React.Dispatch<React.SetStateAction<Clip[]>>;
}

export const Container: FC<ContainerProps> = ({ zoom, clips, setClips }) => {
  const updateClip = useCallback(
    (clip: Clip) => { 
      const index = clips.findIndex((elem => elem.id === clip.id));

      setClips(
        update(clips, {
          [index]: {
            $merge: { left: clip.left, top: clip.top }
          },
        }),
      )
    },
    [clips],
  );

  const shallowClone = (obj: Clip) => {
    return Object.create(
      Object.getPrototypeOf(obj),
      Object.getOwnPropertyDescriptors(obj)
    );
  }

  const [, drop] = useDrop(
    () => {
      return {
        accept: ItemTypes.BOX,
        drop(item: DragItem, monitor: any) {
          const clip = clips.find(elem => elem.id === item.id) as Clip;

          const clipCopy = shallowClone(clip);

          clipCopy.left = Math.round((clipCopy.left + monitor.getDifferenceFromInitialOffset().x))
          clipCopy.top = Math.round(clipCopy.top + monitor.getDifferenceFromInitialOffset().y)

          const filteredClips = clips.filter(elem => elem.id !== clipCopy.id);

          const notOveralappedClips: boolean[] = [];
          filteredClips.forEach((c) => notOveralappedClips.push(areRectanglesOverlapped(clipCopy, c)));

          const clipsCanBeUpdated = notOveralappedClips.every(bool => bool === false);
          clipsCanBeUpdated && updateClip(clipCopy); 
          return undefined
        },
      }
    },
    [updateClip]
  );

  useEffect(() => {
    const clipsCopy = clips.map(async (clip) => {
      const clone = shallowClone(clip);
      clone.zoom = zoom;
      await clone.ready;
      return clone;
    });

    Promise.all(clipsCopy).then(result => setClips(result));
  }, [zoom]);

  return (
    <div id='container' ref={drop} style={{ ...styles, width: '100%' }}> {/*MIN_RULER_WIDTH_PX * zoom*/}
      {clips.map((clip) => {
        return <MediaClip key={clip.id} clip={clip} />
      })}
    </div>
  )
}
