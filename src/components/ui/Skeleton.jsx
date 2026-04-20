import React from 'react';

export function Skeleton({ width = '100%', height = '16px', radius = 'var(--radius-sm)', style }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}
