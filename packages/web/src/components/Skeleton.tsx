import { cn } from '@campaign-manager/ui';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded bg-surface-2', className)} />;
}
