import { CSSProperties, FC, useState } from 'react'
import type { XYCoord } from 'react-dnd'
import { useDragLayer } from 'react-dnd'
import { useEffect } from 'react'

import { BoxDragPreview } from './BoxDragPreview'
import { ItemTypes } from './ItemTypes'
import { snapToGrid } from './snapToGrid'

import { useDragDropManager } from 'react-dnd'
import { Clip } from './clip'
import { MIN_RULER_WIDTH_SECONDS } from './constants'

const layerStyles: CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: `${MIN_RULER_WIDTH_SECONDS}px`, 
  height: '100%',
}

function getItemStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  isSnapToGrid: boolean,
  item: Clip,
  clips: Clip[]
) {
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  if (isSnapToGrid) {
    x -= initialOffset.x
    y -= initialOffset.y;
    [x, y] = snapToGrid(x, y)
    x += initialOffset.x
    y += initialOffset.y
  }

  const clip = clips.find(clip => clip.id === item.id)!;

  const styles = {
    position: 'absolute',
    top: `${y}px`,
    left: `${x}px`,
    width: `${clip.width}px`,
    height: `${clip.height}px`,
    border: '1px solid'
  }
  return {
    ...styles
  }
}

export interface CustomDragLayerProps {
  snapToGrid: boolean,
  clips: Clip[],
}

export const CustomDragLayer: FC<CustomDragLayerProps> = ({clips}) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }))

  function renderItem() {
    const thumbnails = clips.find(clip => clip?.id === item?.id)?.thumbnails!;
    switch (itemType) {
      case ItemTypes.BOX:
        return thumbnails ? <BoxDragPreview thumbnails={thumbnails} /> : null
      default:
        return null
    }
  }

  // if (!isDragging) {
  //   return null
  // }

  return (
    <div style={layerStyles}>
      <div
        //@ts-ignore
        style={getItemStyles(initialOffset, currentOffset, snapToGrid, item, clips)}
      >
        {renderItem()}
      </div>
    </div>
  )
}
