import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard className combiner utility (shadcn standard)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
