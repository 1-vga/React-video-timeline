import type { CSSProperties, FC } from 'react'
import { memo, useEffect, useState } from 'react'

import { Box } from './Box'

const styles: CSSProperties = {
  display: 'inline-block',
  height: '100%',
  width: '100%'
}

export interface BoxDragPreviewProps {
  thumbnails: string[]
}

export interface BoxDragPreviewState {
  tickTock: any
}

export const BoxDragPreview: FC<BoxDragPreviewProps> = memo(
  function BoxDragPreview({ thumbnails }) {
    const [tickTock, setTickTock] = useState(false)

    useEffect(
      function subscribeToIntervalTick() {
        const interval = setInterval(() => setTickTock(!tickTock), 500)
        return () => clearInterval(interval)
      },
      [tickTock],
    )

    return (
      <div style={styles}>
        <Box thumbnails={thumbnails} />
      </div>
    )
  },
)
