import type { CSSProperties } from 'react';

export function driftStyle(id: string, rotation = 0): CSSProperties {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index) * (index + 1)) % 997;
  }

  return {
    animationName: 'tk-drift',
    animationDuration: `${15 + (hash % 12)}s`,
    animationDelay: `${-(hash % 16)}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
    ['--tk-rot' as string]: `${rotation}deg`,
  };
}
