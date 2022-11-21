import type { CSSProperties, FC } from 'react'
import { memo } from 'react'

const styles: CSSProperties = {
  cursor: 'move',
  display: 'flex',
  height: '100%',
  width: '100%'
}

const imgStyles: CSSProperties = {
  height: '100%',
}

export interface BoxProps {
  preview?: boolean
  thumbnails: string[]
}

export const Box: FC<BoxProps> = memo(function Box({ preview, thumbnails }) {
  return (
    <div
      style={{ ...styles }}
      role={preview ? 'BoxPreview' : 'Box'}
    >
      {
        thumbnails.map((t, i) => 
        <div style={{width: '100%'}}>
          <img 
            key={i} 
            style={{height: '100%', width: `100%`, display: 'inline-block'}} 
            src={t} 
            alt='thumbnail' 
          />
        </div>)
      }
    </div>
  )
})
