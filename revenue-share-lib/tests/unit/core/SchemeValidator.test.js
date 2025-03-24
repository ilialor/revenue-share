/**
 * @fileoverview Tests for the SchemeValidator core class
 * @author RevShare Library
 * @version 1.0.0
 */

import SchemeValidator from '../../../src/core/SchemeValidator';

describe('SchemeValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemeValidator();
  });

  test('Valid simple scheme', () => {
    const scheme = {
      author: { percentage: 70 },
      platform: { percentage: 30 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('Valid complete scheme', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 20 },
      first100: { count: 100, percentage: 30 },
      allBuyers: { percentage: 10 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('Valid scheme with remainder', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 20 },
      allBuyers: { remainder: true }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('Invalid scheme - percentages over 100%', () => {
    const scheme = {
      author: { percentage: 60 },
      platform: { percentage: 50 }
    };

    const result = validator.validate(scheme, { strictPercentageTotal: true });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Invalid scheme - negative percentage', () => {
    const scheme = {
      author: { percentage: -10 },
      platform: { percentage: 110 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Invalid scheme - multiple remainder rules', () => {
    const scheme = {
      author: { remainder: true },
      platform: { percentage: 50 },
      allBuyers: { remainder: true }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Invalid scheme - percentage and remainder together', () => {
    const scheme = {
      author: { percentage: 50, remainder: true },
      platform: { percentage: 50 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Invalid scheme - invalid count', () => {
    const scheme = {
      author: { percentage: 50 },
      platform: { percentage: 30 },
      first0: { count: 0, percentage: 20 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Invalid scheme - non-object rule', () => {
    const scheme = {
      author: { percentage: 50 },
      platform: "not an object"
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Empty scheme validation', () => {
    const result = validator.validate({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Null scheme validation', () => {
    const result = validator.validate(null);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Warning when percentage total is not 100%', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 30 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  test('suggestFixes method fixes percentage total', () => {
    const scheme = {
      author: { percentage: 60 },
      platform: { percentage: 60 }
    };

    const result = validator.validate(scheme, { strictPercentageTotal: true });
    expect(result.isValid).toBe(false);

    const fixedScheme = validator.suggestFixes(scheme, result.errors);
    
    // Check that percentages are scaled down proportionally
    expect(fixedScheme.author.percentage + fixedScheme.platform.percentage).toBeCloseTo(100, 1);
  });

  test('suggestFixes method adds remainder when needed', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 30 }
    };

    const result = validator.validate(scheme);
    expect(result.warnings.some(w => w.includes("doesn't equal 100%"))).toBe(true);

    const fixedScheme = validator.suggestFixes(scheme, result.errors);
    
    // Check that remainder is added to author
    expect(fixedScheme.author.remainder).toBe(true);
  });
});
