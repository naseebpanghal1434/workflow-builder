/**
 * @fileoverview Classname utility for conditional class merging
 * @module Lib/Utils/CN
 */

/**
 * Combines class names conditionally
 * Filters out falsy values and joins with space
 *
 * @param {...(string | boolean | undefined | null)[]} classes - Class names or falsy values
 * @returns {string} Combined class string
 *
 * @example
 * cn('base-class', isActive && 'active', disabled && 'disabled')
 * // Returns: 'base-class active' (if isActive is true and disabled is false)
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(' ');
}
