import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Gộp Tailwind class names, loại bỏ conflicts tự động.
 * @example cn('px-4 py-2', isActive && 'bg-indigo-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
