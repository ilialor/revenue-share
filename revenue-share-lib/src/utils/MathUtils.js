/**
 * @fileoverview Math utilities for revenue sharing calculations
 * @author RevShare Library
 * @version 1.0.0
 */

/**
 * Check if a value is numeric
 * @param {*} value - Value to check
 * @return {boolean} - Whether the value is numeric
 */
export function isNumeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Deep clone an object or array
 * @param {*} obj - Object to clone
 * @return {*} - Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Round a number to two decimal places (cents)
 * @param {number} value - Value to round
 * @return {number} - Rounded value
 */
export function roundToCents(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Sum an array of numbers
 * @param {Array<number>} numbers - Array of numbers to sum
 * @return {number} - Sum of the numbers
 */
export function sum(numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}

/**
 * Calculate the percentage of a value
 * @param {number} value - The base value
 * @param {number} percentage - The percentage to calculate
 * @return {number} - The calculated percentage value
 */
export function calculatePercentage(value, percentage) {
  return (value * percentage) / 100;
}

/**
 * Distribute a value among n items
 * @param {number} value - The value to distribute
 * @param {number} count - The number of items to distribute among
 * @return {number} - The individual share
 */
export function distributeEvenly(value, count) {
  if (count <= 0) return 0;
  return value / count;
}

/**
 * Check if two floating point numbers are approximately equal
 * @param {number} a - First number
 * @param {number} b - Second number
 * @param {number} [epsilon=0.00001] - Maximum allowed difference
 * @return {boolean} - Whether the numbers are approximately equal
 */
export function approximatelyEqual(a, b, epsilon = 0.00001) {
  return Math.abs(a - b) < epsilon;
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @return {number} - Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Format a number as currency
 * @param {number} value - Value to format
 * @param {string} [currency='USD'] - Currency code
 * @param {string} [locale='en-US'] - Locale for formatting
 * @return {string} - Formatted currency string
 */
export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}
