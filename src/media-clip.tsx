import type { CSSProperties, FC } from 'react'
import { memo, useEffect } from 'react'
import type { DragSourceMonitor } from 'react-dnd'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'
import {Clip} from './clip';

import { Box } from './Box'
import { ItemTypes } from './ItemTypes'

function getStyles(
  clip: Clip,
  isDragging: boolean,
): CSSProperties {
  const transform = `translate3d(${clip.left}px, ${clip.top}px, 0)`

  return {
    position: 'absolute',
    transform,
    WebkitTransform: transform,
    opacity: isDragging ? 0 : 1,
    height: `${clip.height}px`,
    border: '1px solid',
    width: `${clip.width}px`
  }
}

interface Props {
  clip: Clip,
}

export const MediaClip: FC<Props> = memo(function MediaClip(props) {
  const { clip } = props;

  const [{ isDragging }, drag, preview] = useDrag(
    () => {
      return{
      type: ItemTypes.BOX,
      item: { 
        id: clip.id, 
      },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
        top: 'value'
      }),
    }},
    [clip.id],
  )

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])

  return (
    <div
      ref={drag}
      style={{...getStyles(clip, isDragging)}
      }
      role="Clip"
    >
      <Box thumbnails={clip.thumbnails} />
    </div>
  )
})
