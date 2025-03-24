/**
 * @fileoverview Tests for the MathUtils utility functions
 * @author RevShare Library
 * @version 1.0.0
 */

import * as MathUtils from '../../../src/utils/MathUtils';

describe('MathUtils', () => {
  describe('percentage', () => {
    test('calculates correct percentage of a number', () => {
      expect(MathUtils.percentage(100, 25)).toBe(25);
      expect(MathUtils.percentage(200, 10)).toBe(20);
      expect(MathUtils.percentage(0, 50)).toBe(0);
    });

    test('handles floating point numbers correctly', () => {
      expect(MathUtils.percentage(100, 33.33)).toBeCloseTo(33.33, 2);
      expect(MathUtils.percentage(67.5, 10)).toBeCloseTo(6.75, 2);
    });

    test('returns 0 for negative percentages', () => {
      expect(MathUtils.percentage(100, -10)).toBe(0);
    });
  });

  describe('roundToDecimalPlaces', () => {
    test('rounds numbers to specified decimal places', () => {
      expect(MathUtils.roundToDecimalPlaces(10.126, 2)).toBe(10.13);
      expect(MathUtils.roundToDecimalPlaces(10.124, 2)).toBe(10.12);
      expect(MathUtils.roundToDecimalPlaces(10.5, 0)).toBe(11);
    });

    test('handles negative numbers', () => {
      expect(MathUtils.roundToDecimalPlaces(-10.126, 2)).toBe(-10.13);
    });

    test('handles zero decimal places', () => {
      expect(MathUtils.roundToDecimalPlaces(10.6, 0)).toBe(11);
    });

    test('defaults to 2 decimal places if not specified', () => {
      expect(MathUtils.roundToDecimalPlaces(10.126)).toBe(10.13);
    });
  });

  describe('sumArray', () => {
    test('returns the sum of all array elements', () => {
      expect(MathUtils.sumArray([1, 2, 3, 4])).toBe(10);
      expect(MathUtils.sumArray([10, -5, 3.5])).toBe(8.5);
    });

    test('returns 0 for empty array', () => {
      expect(MathUtils.sumArray([])).toBe(0);
    });
  });

  describe('distributeProportion', () => {
    test('distributes value proportionally to weights', () => {
      const distribution = MathUtils.distributeProportion(100, [1, 2, 2]);
      expect(distribution).toEqual([20, 40, 40]);
    });

    test('handles zero weights by returning zeros', () => {
      const distribution = MathUtils.distributeProportion(100, [0, 0, 0]);
      expect(distribution).toEqual([0, 0, 0]);
    });

    test('distributes remaining fraction fairly', () => {
      // 100 ÷ 3 = 33.33... should be distributed as 33.34, 33.33, 33.33
      const distribution = MathUtils.distributeProportion(100, [1, 1, 1]);
      expect(Math.round(distribution.reduce((a, b) => a + b, 0))).toBe(100);
      expect(distribution[0]).toBeGreaterThanOrEqual(distribution[1]);
    });
  });

  describe('scalePercentages', () => {
    test('scales percentages to sum to target', () => {
      const scaled = MathUtils.scalePercentages([40, 60, 100], 100);
      expect(scaled.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 1);
      
      // Should maintain proportions
      expect(scaled[1] / scaled[0]).toBeCloseTo(60 / 40, 1);
    });

    test('handles zero percentages', () => {
      const scaled = MathUtils.scalePercentages([0, 50, 50], 100);
      expect(scaled).toEqual([0, 50, 50]);
    });

    test('handles all zeros', () => {
      const scaled = MathUtils.scalePercentages([0, 0, 0], 100);
      expect(scaled).toEqual([0, 0, 0]);
    });
  });
});
