import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind-aware classnames merger.
 * Combines `clsx` (conditional join) with `tailwind-merge` (conflict resolution).
 *
 *   cn("px-3", condition && "px-4")  // → "px-4"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
