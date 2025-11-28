import React from 'react'

type Props = {
  lines?: number
  height?: number
}

export default function Skeleton({ lines = 3, height = 14 }: Props) {
  const items = Array.from({ length: lines })
  return (
    <div className="skeleton">
      {items.map((_, i) => (
        <div key={i} className="skeleton-line" style={{ height: `${height}px`, width: `${80 - i * 10}%` }} />
      ))}
    </div>
  )
}
