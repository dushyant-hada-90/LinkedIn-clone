import * as React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({ src, fallback, size = 'md', className, ...props }: AvatarProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-full bg-accent', sizeMap[size], className)} {...props}>
      {src ? (
        <img src={src} alt={fallback || 'avatar'} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted">
          {fallback?.slice(0, 2).toUpperCase() || '👤'}
        </div>
      )}
    </div>
  );
}
