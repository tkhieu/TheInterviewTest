import * as React from 'react';
import { cn } from '../lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** User's full name — used for fallback initials and aria-label. */
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-7 w-7 text-[12px]',
  lg: 'h-9 w-9 text-[13px]',
} as const;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

/**
 * Circular avatar — image with initials fallback.
 * Uses the indigo accent for fallback bg to match brand.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, src, size = 'md', className, ...props }, ref) => {
    const [errored, setErrored] = React.useState(false);
    return (
      <div
        ref={ref}
        role="img"
        aria-label={name}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-semibold overflow-hidden bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
          sizes[size],
          className
        )}
        {...props}
      >
        {src && !errored ? (
          <img src={src} alt="" className="h-full w-full object-cover" onError={() => setErrored(true)} />
        ) : (
          initials(name)
        )}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';
