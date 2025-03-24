/**
 * @fileoverview Tests for the ValidationUtils utility functions
 * @author RevShare Library
 * @version 1.0.0
 */

import * as ValidationUtils from '../../../src/utils/ValidationUtils';

describe('ValidationUtils', () => {
  describe('isPositiveNumber', () => {
    test('validates positive numbers', () => {
      expect(ValidationUtils.isPositiveNumber(10)).toBe(true);
      expect(ValidationUtils.isPositiveNumber(0.5)).toBe(true);
    });

    test('rejects zero and negative numbers', () => {
      expect(ValidationUtils.isPositiveNumber(0)).toBe(false);
      expect(ValidationUtils.isPositiveNumber(-10)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(ValidationUtils.isPositiveNumber('10')).toBe(false);
      expect(ValidationUtils.isPositiveNumber(null)).toBe(false);
      expect(ValidationUtils.isPositiveNumber(undefined)).toBe(false);
      expect(ValidationUtils.isPositiveNumber({})).toBe(false);
    });
  });

  describe('isNonNegativeNumber', () => {
    test('validates non-negative numbers', () => {
      expect(ValidationUtils.isNonNegativeNumber(10)).toBe(true);
      expect(ValidationUtils.isNonNegativeNumber(0)).toBe(true);
      expect(ValidationUtils.isNonNegativeNumber(0.5)).toBe(true);
    });

    test('rejects negative numbers', () => {
      expect(ValidationUtils.isNonNegativeNumber(-10)).toBe(false);
      expect(ValidationUtils.isNonNegativeNumber(-0.5)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(ValidationUtils.isNonNegativeNumber('10')).toBe(false);
      expect(ValidationUtils.isNonNegativeNumber(null)).toBe(false);
      expect(ValidationUtils.isNonNegativeNumber(undefined)).toBe(false);
      expect(ValidationUtils.isNonNegativeNumber({})).toBe(false);
    });
  });

  describe('isPercentage', () => {
    test('validates valid percentages', () => {
      expect(ValidationUtils.isPercentage(0)).toBe(true);
      expect(ValidationUtils.isPercentage(50)).toBe(true);
      expect(ValidationUtils.isPercentage(100)).toBe(true);
    });

    test('rejects percentages outside valid range', () => {
      expect(ValidationUtils.isPercentage(-10)).toBe(false);
      expect(ValidationUtils.isPercentage(101)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(ValidationUtils.isPercentage('50')).toBe(false);
      expect(ValidationUtils.isPercentage(null)).toBe(false);
      expect(ValidationUtils.isPercentage(undefined)).toBe(false);
      expect(ValidationUtils.isPercentage({})).toBe(false);
    });
  });

  describe('isPositiveInteger', () => {
    test('validates positive integers', () => {
      expect(ValidationUtils.isPositiveInteger(1)).toBe(true);
      expect(ValidationUtils.isPositiveInteger(10)).toBe(true);
    });

    test('rejects zero, non-integers, and negative numbers', () => {
      expect(ValidationUtils.isPositiveInteger(0)).toBe(false);
      expect(ValidationUtils.isPositiveInteger(-10)).toBe(false);
      expect(ValidationUtils.isPositiveInteger(10.5)).toBe(false);
    });

    test('rejects non-number values', () => {
      expect(ValidationUtils.isPositiveInteger('10')).toBe(false);
      expect(ValidationUtils.isPositiveInteger(null)).toBe(false);
      expect(ValidationUtils.isPositiveInteger(undefined)).toBe(false);
      expect(ValidationUtils.isPositiveInteger({})).toBe(false);
    });
  });

  describe('isObject', () => {
    test('validates objects', () => {
      expect(ValidationUtils.isObject({})).toBe(true);
      expect(ValidationUtils.isObject({ a: 1 })).toBe(true);
    });

    test('rejects non-objects', () => {
      expect(ValidationUtils.isObject(null)).toBe(false);
      expect(ValidationUtils.isObject(undefined)).toBe(false);
      expect(ValidationUtils.isObject('string')).toBe(false);
      expect(ValidationUtils.isObject(10)).toBe(false);
      expect(ValidationUtils.isObject([])).toBe(false);
      expect(ValidationUtils.isObject(() => {})).toBe(false);
    });
  });

  describe('isString', () => {
    test('validates strings', () => {
      expect(ValidationUtils.isString('')).toBe(true);
      expect(ValidationUtils.isString('hello')).toBe(true);
    });

    test('rejects non-strings', () => {
      expect(ValidationUtils.isString(null)).toBe(false);
      expect(ValidationUtils.isString(undefined)).toBe(false);
      expect(ValidationUtils.isString(10)).toBe(false);
      expect(ValidationUtils.isString({})).toBe(false);
      expect(ValidationUtils.isString([])).toBe(false);
      expect(ValidationUtils.isString(() => {})).toBe(false);
    });
  });

  describe('isValidBuyerName', () => {
    test('validates proper buyer names', () => {
      expect(ValidationUtils.isValidBuyerName('buyer1')).toBe(true);
      expect(ValidationUtils.isValidBuyerName('user@example.com')).toBe(true);
      expect(ValidationUtils.isValidBuyerName('John Doe')).toBe(true);
    });

    test('rejects invalid buyer names', () => {
      expect(ValidationUtils.isValidBuyerName('')).toBe(false);
      expect(ValidationUtils.isValidBuyerName(' ')).toBe(false);
      expect(ValidationUtils.isValidBuyerName(null)).toBe(false);
      expect(ValidationUtils.isValidBuyerName(undefined)).toBe(false);
      expect(ValidationUtils.isValidBuyerName(10)).toBe(false);
    });
  });

  describe('isValidProductName', () => {
    test('validates proper product names', () => {
      expect(ValidationUtils.isValidProductName('Product1')).toBe(true);
      expect(ValidationUtils.isValidProductName('Advanced Course 2023')).toBe(true);
    });

    test('rejects invalid product names', () => {
      expect(ValidationUtils.isValidProductName('')).toBe(false);
      expect(ValidationUtils.isValidProductName(' ')).toBe(false);
      expect(ValidationUtils.isValidProductName(null)).toBe(false);
      expect(ValidationUtils.isValidProductName(undefined)).toBe(false);
      expect(ValidationUtils.isValidProductName(10)).toBe(false);
    });
  });

  describe('isValidSchemeRule', () => {
    test('validates percentage rule', () => {
      expect(ValidationUtils.isValidSchemeRule({ percentage: 50 })).toBe(true);
    });

    test('validates remainder rule', () => {
      expect(ValidationUtils.isValidSchemeRule({ remainder: true })).toBe(true);
    });

    test('validates count with percentage rule', () => {
      expect(ValidationUtils.isValidSchemeRule({ count: 10, percentage: 20 })).toBe(true);
    });

    test('validates count with percentage and fromEnd rule', () => {
      expect(ValidationUtils.isValidSchemeRule({ count: 10, percentage: 20, fromEnd: true })).toBe(true);
    });

    test('rejects invalid rules', () => {
      expect(ValidationUtils.isValidSchemeRule({})).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ percentage: -10 })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ percentage: 'invalid' })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ remainder: 'true' })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ count: 0, percentage: 20 })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ count: -10, percentage: 20 })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ count: 10, fromEnd: true })).toBe(false);
      expect(ValidationUtils.isValidSchemeRule({ percentage: 20, remainder: true })).toBe(false);
    });
  });
});
