import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes
 * @param {...any} inputs - Class names to be combined
 * @returns {string} - Combined and optimized class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} - Formatted number string
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('es-ES').format(num);
}
