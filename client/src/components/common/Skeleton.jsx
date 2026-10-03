import React from 'react';

export function Skeleton({ width = '100%', height = '20px', borderRadius = '0.5rem', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ height = '260px' }) {
  return (
    <div
      className="glass-card skeleton-card"
      style={{
        height,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1rem',
      }}
    >
      <Skeleton height="70%" borderRadius="0.5rem" />
      <Skeleton height="16px" width="80%" />
      <Skeleton height="12px" width="50%" />
    </div>
  );
}

export function SkeletonGrid({ count = 3, cardHeight = '240px' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} height={cardHeight} />
      ))}
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <Skeleton width="64px" height="64px" borderRadius="1rem" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <Skeleton width="40%" height="24px" />
        <Skeleton width="60%" height="16px" />
      </div>
    </div>
  );
}

export default Skeleton;
