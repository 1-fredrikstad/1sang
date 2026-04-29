import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining Tailwind class names safely.
 * - clsx handles conditional classes (truthy/falsy, arrays, etc.)
 * - twMerge removes conflicting Tailwind classes (e.g. p-2 + p-4 → p-4)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
