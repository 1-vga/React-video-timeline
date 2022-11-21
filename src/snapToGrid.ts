export function snapToGrid(x: number, y: number): [number, number] {
    const snappedX = Math.round(x / 1) * 1
    const snappedY = Math.round(y / 1) * 1
    return [snappedX, snappedY]
  }
  