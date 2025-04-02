/**
 * @fileoverview Tests for the MathUtils utility functions
 * @author RevShare Library
 * @version 1.0.0
 */

import { isNumeric, deepClone, roundToCents, sum, calculatePercentage, distributeEvenly, approximatelyEqual, clamp, formatCurrency } from '../../../src/utils/MathUtils';

describe('MathUtils', () => {
  describe('calculatePercentage', () => {
    test('calculates correct percentage of a number', () => {
      expect(calculatePercentage(100, 25)).toBe(25);
      expect(calculatePercentage(200, 10)).toBe(20);
      expect(calculatePercentage(0, 50)).toBe(0);
    });

    test('handles floating point numbers correctly', () => {
      expect(calculatePercentage(100, 33.33)).toBeCloseTo(33.33, 2);
      expect(calculatePercentage(67.5, 10)).toBeCloseTo(6.75, 2);
    });

    test('returns negative value for negative percentages', () => {
      expect(calculatePercentage(100, -10)).toBe(-10);
    });
  });

  describe('roundToCents', () => {
    test('rounds numbers to two decimal places', () => {
      expect(roundToCents(10.126)).toBe(10.13);
      expect(roundToCents(10.124)).toBe(10.12);
      expect(roundToCents(10.5)).toBe(10.5);
    });

    test('handles negative numbers', () => {
      expect(roundToCents(-10.126)).toBe(-10.13);
    });
  });

  describe('sum', () => {
    test('returns the sum of all array elements', () => {
      expect(sum([1, 2, 3, 4])).toBe(10);
      expect(sum([10, -5, 3.5])).toBe(8.5);
    });

    test('returns 0 for empty array', () => {
      expect(sum([])).toBe(0);
    });
  });

  describe('distributeEvenly', () => {
    test('distributes value evenly among items', () => {
      const value = distributeEvenly(100, 3);
      expect(typeof value).toBe('number');
      expect(value).toBeCloseTo(33.33, 2);
    });

    test('handles zero count', () => {
      const value = distributeEvenly(100, 0);
      expect(value).toBe(0);
    });

    test('handles negative value', () => {
      const value = distributeEvenly(-100, 3);
      expect(typeof value).toBe('number');
      expect(value).toBeCloseTo(-33.33, 2);
    });
  });

  describe('approximatelyEqual', () => {
    test('compares numbers with default epsilon', () => {
      expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(approximatelyEqual(0.1 + 0.2, 0.3, 0.0001)).toBe(true);
      expect(approximatelyEqual(0.1 + 0.2, 0.3, 0.000001)).toBe(true);
    });
  });

  describe('clamp', () => {
    test('clamps value between min and max', () => {
      expect(clamp(5, 1, 10)).toBe(5);
      expect(clamp(0, 1, 10)).toBe(1);
      expect(clamp(15, 1, 10)).toBe(10);
    });

    test('handles equal min and max', () => {
      expect(clamp(5, 10, 10)).toBe(10);
    });
  });

  describe('formatCurrency', () => {
    test('formats numbers as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    });

    test('handles negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000.00');
    });
  });
});
