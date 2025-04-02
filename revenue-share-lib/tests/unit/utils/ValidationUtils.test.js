/**
 * @fileoverview Tests for the ValidationUtils utility functions
 * @author RevShare Library
 * @version 1.0.0
 */

import { isPositiveNumber, isNonNegativeNumber, isPercentage, isPositiveInteger, isObject, isValidBuyerName, isValidProductName, isValidSchemeRule, validateSale, validateLibraryParams, validateSales } from '../../../src/utils/ValidationUtils';

describe('ValidationUtils', () => {
  describe('isPositiveNumber', () => {
    test('validates positive numbers', () => {
      expect(isPositiveNumber(10)).toBe(true);
      expect(isPositiveNumber(0.5)).toBe(true);
    });

    test('rejects zero and negative numbers', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-10)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(isPositiveNumber('10')).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber(undefined)).toBe(false);
      expect(isPositiveNumber({})).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    test('validates non-negative numbers', () => {
      expect(isNonNegativeNumber(10)).toBe(true);
      expect(isNonNegativeNumber(0)).toBe(true);
      expect(isNonNegativeNumber(0.5)).toBe(true);
    });

    test('rejects negative numbers', () => {
      expect(isNonNegativeNumber(-10)).toBe(false);
      expect(isNonNegativeNumber(-0.5)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(isNonNegativeNumber('10')).toBe(false);
      expect(isNonNegativeNumber(null)).toBe(false);
      expect(isNonNegativeNumber(undefined)).toBe(false);
      expect(isNonNegativeNumber({})).toBe(false);
    });
  });

  describe('isPercentage', () => {
    test('validates valid percentages', () => {
      expect(isPercentage(0)).toBe(true);
      expect(isPercentage(50)).toBe(true);
      expect(isPercentage(100)).toBe(true);
    });

    test('rejects invalid percentages', () => {
      expect(isPercentage(-10)).toBe(false);
      expect(isPercentage(101)).toBe(false);
      expect(isPercentage('50')).toBe(false);
      expect(isPercentage(null)).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    test('validates positive integers', () => {
      expect(isPositiveInteger(1)).toBe(true);
      expect(isPositiveInteger(100)).toBe(true);
    });

    test('rejects non-positive integers', () => {
      expect(isPositiveInteger(0)).toBe(false);
      expect(isPositiveInteger(-1)).toBe(false);
      expect(isPositiveInteger(1.5)).toBe(false);
      expect(isPositiveInteger('1')).toBe(false);
    });
  });

  describe('isObject', () => {
    test('validates objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ key: 'value' })).toBe(true);
    });

    test('rejects non-objects', () => {
      expect(isObject(null)).toBe(false);
      expect(isObject([])).toBe(false);
      expect(isObject('string')).toBe(false);
      expect(isObject(123)).toBe(false);
    });
  });

  describe('isValidBuyerName', () => {
    test('validates proper buyer names', () => {
      expect(isValidBuyerName('buyer1')).toBe(true);
      expect(isValidBuyerName('user@example.com')).toBe(true);
      expect(isValidBuyerName('John Doe')).toBe(true);
    });

    test('rejects invalid buyer names', () => {
      expect(isValidBuyerName('')).toBe(false);
      expect(isValidBuyerName(null)).toBe(false);
      expect(isValidBuyerName(undefined)).toBe(false);
      expect(isValidBuyerName(123)).toBe(false);
    });
  });

  describe('isValidProductName', () => {
    test('validates proper product names', () => {
      expect(isValidProductName('Product 1')).toBe(true);
      expect(isValidProductName('Premium Service')).toBe(true);
      expect(isValidProductName('Basic Plan')).toBe(true);
    });

    test('rejects invalid product names', () => {
      expect(isValidProductName('')).toBe(false);
      expect(isValidProductName(null)).toBe(false);
      expect(isValidProductName(undefined)).toBe(false);
      expect(isValidProductName(123)).toBe(false);
    });
  });

  describe('isValidSchemeRule', () => {
    test('validates proper scheme rules', () => {
      const validRules = [
        { percentage: 50 },
        { count: 100, percentage: 30 },
        { remainder: true }
      ];

      validRules.forEach(rule => {
        expect(isValidSchemeRule(rule)).toBe(true);
      });
    });

    test('rejects invalid scheme rules', () => {
      const invalidRules = [
        {},
        { percentage: -10 },
        { percentage: 110 },
        { count: -1 },
        { count: 0 },
        { count: 100, percentage: 30, remainder: true },
        { percentage: 30, remainder: true },
        { count: 100, remainder: true }
      ];

      invalidRules.forEach(rule => {
        expect(isValidSchemeRule(rule)).toBe(false);
      });
    });
  });

  describe('validateSale', () => {
    test('validates proper sales', () => {
      const validSales = [
        { buyer: 'buyer1', product: 'Product A', amount: 100 },
        { buyer: 'user@example.com', product: 'Premium Service', amount: 199.99 }
      ];

      validSales.forEach(sale => {
        const result = validateSale(sale);
        expect(result.isValid).toBe(true);
        expect(result.errors.length).toBe(0);
      });
    });

    test('validates invalid sales', () => {
      const invalidSales = [
        { buyer: '', product: 'Product A', amount: 100 },
        { buyer: 'buyer1', product: '', amount: 100 },
        { buyer: 'buyer1', product: 'Product A', amount: -10 },
        { buyer: 123, product: 'Product A', amount: 100 },
        { buyer: 'buyer1', product: 123, amount: 100 },
        { buyer: 'buyer1', product: 'Product A' }
      ];

      invalidSales.forEach(sale => {
        const result = validateSale(sale);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateLibraryParams', () => {
    test('validates proper initialization parameters', () => {
      const validParams = {
        defaultScheme: {
          author: { percentage: 70 },
          platform: { percentage: 30 }
        }
      };

      const result = validateLibraryParams(validParams);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('validates invalid initialization parameters', () => {
      const invalidParams = [
        {},
        { defaultScheme: null },
        { defaultScheme: 'not an object' },
        { defaultScheme: { author: { percentage: -10 } } }
      ];

      invalidParams.forEach(params => {
        const result = validateLibraryParams(params);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('validateSales', () => {
    test('validates proper sales array', () => {
      const sales = [
        { buyer: 'buyer1', product: 'Product A', amount: 100 },
        { buyer: 'buyer2', product: 'Product B', amount: 150 }
      ];

      const result = validateSales(sales);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('validates invalid sales array', () => {
      const sales = [
        { buyer: 'buyer1', product: 'Product A', amount: 100 },
        { buyer: '', product: 'Product B', amount: 150 }
      ];

      const result = validateSales(sales);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
    });

    test('handles empty sales array', () => {
      const result = validateSales([]);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('handles non-array input', () => {
      const result = validateSales('not an array');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toBe('Sales must be an array');
    });
  });
});
