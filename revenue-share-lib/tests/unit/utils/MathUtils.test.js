/**
 * @fileoverview Tests for the MathUtils utility functions
 * @author RevShare Library
 * @version 1.0.0
 */

import { isNumeric, deepClone, roundToCents, sum, calculatePercentage, distributeEvenly, approximatelyEqual, clamp, formatCurrency } from '../../../src/utils/MathUtils';

describe('MathUtils', () => {
  describe('isNumeric', () => {
    test('identifies numeric values', () => {
      expect(isNumeric(42)).toBe(true);
      expect(isNumeric('42')).toBe(true);
      expect(isNumeric(3.14)).toBe(true);
      expect(isNumeric('-42')).toBe(true);
    });

    test('identifies non-numeric values', () => {
      expect(isNumeric('abc')).toBe(false);
      expect(isNumeric(null)).toBe(false);
      expect(isNumeric(undefined)).toBe(false);
      expect(isNumeric(NaN)).toBe(false);
      expect(isNumeric(Infinity)).toBe(false);
    });
  });

  describe('deepClone', () => {
    test('clones simple objects', () => {
      const obj = { a: 1, b: 2 };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone).not.toBe(obj);
    });

    test('clones nested objects', () => {
      const obj = { a: 1, b: { c: 2, d: 3 } };
      const clone = deepClone(obj);
      expect(clone).toEqual(obj);
      expect(clone.b).not.toBe(obj.b);
    });

    test('clones arrays', () => {
      const arr = [1, 2, { a: 3 }];
      const clone = deepClone(arr);
      expect(clone).toEqual(arr);
      expect(clone[2]).not.toBe(arr[2]);
    });
  });

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

    test('handles edge cases', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(100, 100)).toBe(100);
      expect(calculatePercentage(100, 101)).toBe(100);
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

    test('handles edge cases', () => {
      expect(roundToCents(0)).toBe(0);
      expect(roundToCents(999999999999.999)).toBe(1000000000000);
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

    test('handles edge cases', () => {
      expect(sum([0, 0, 0])).toBe(0);
      expect(sum([Infinity, -Infinity])).toBe(NaN);
    });
  });

  describe('distributeEvenly', () => {
    test('distributes value evenly among items', () => {
      const value = distributeEvenly(100, 3);
      expect(value).toBeCloseTo(33.33, 2);
    });

    test('handles zero count', () => {
      expect(distributeEvenly(100, 0)).toBe(0);
    });

    test('handles negative value', () => {
      const value = distributeEvenly(-100, 3);
      expect(value).toBeCloseTo(-33.33, 2);
    });

    test('handles edge cases', () => {
      expect(distributeEvenly(0, 1)).toBe(0);
      expect(distributeEvenly(100, 1)).toBe(100);
    });
  });

  describe('approximatelyEqual', () => {
    test('compares numbers with default epsilon', () => {
      expect(approximatelyEqual(0.1 + 0.2, 0.3)).toBe(true);
      expect(approximatelyEqual(0.1 + 0.2, 0.3, 0.0001)).toBe(true);
      expect(approximatelyEqual(0.1 + 0.2, 0.3, 0.000001)).toBe(false);
    });

    test('handles edge cases', () => {
      expect(approximatelyEqual(0, 0)).toBe(true);
      expect(approximatelyEqual(0, 0.00000001)).toBe(true);
      expect(approximatelyEqual(Infinity, Infinity)).toBe(true);
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

    test('handles edge cases', () => {
      expect(clamp(0, 0, 0)).toBe(0);
      expect(clamp(Infinity, 0, 100)).toBe(100);
      expect(clamp(-Infinity, -100, 0)).toBe(-100);
    });
  });

  describe('formatCurrency', () => {
    test('formats numbers as currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000.00');
      expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
      expect(formatCurrency(1000, 'EUR', 'de-DE')).toBe('1.000,00 €');
    });

    test('handles negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('($1,000.00)');
    });

    test('handles edge cases', () => {
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1.23456789, 'USD', 'en-US')).toBe('$1.23');
    });
  });
});
