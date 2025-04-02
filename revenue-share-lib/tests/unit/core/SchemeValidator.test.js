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
    expect(result.warnings.length).toBe(0);
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
    expect(result.warnings.length).toBe(0);
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
    expect(result.warnings.length).toBe(0);
  });

  test('Invalid scheme - percentages over 100%', () => {
    const scheme = {
      author: { percentage: 60 },
      platform: { percentage: 50 }
    };

    const result = validator.validate(scheme, { strictPercentageTotal: true });
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Total percentage allocation (110%) must equal 100%');
  });

  test('Invalid scheme - negative percentage', () => {
    const scheme = {
      author: { percentage: -10 },
      platform: { percentage: 110 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors).toContain('Percentage for \'author\' must be a number between 0 and 100');
  });

  test('Invalid scheme - multiple remainder rules', () => {
    const scheme = {
      author: { remainder: true },
      platform: { percentage: 50 },
      allBuyers: { remainder: true }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Only one rule can have remainder flag, found 2: author, allBuyers');
  });

  test('Invalid scheme - percentage and remainder together', () => {
    const scheme = {
      author: { percentage: 50, remainder: true },
      platform: { percentage: 50 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Rule for \'author\' cannot have both percentage and remainder');
  });

  test('Invalid scheme - invalid count', () => {
    const scheme = {
      author: { percentage: 50 },
      platform: { percentage: 30 },
      first0: { count: 0, percentage: 20 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Count for \'first0\' must be a positive integer');
  });

  test('Invalid scheme - non-object rule', () => {
    const errors = [];
    const scheme = {
      author: { percentage: 50 },
      platform: "string value instead of object"
    };
    
    validator._validateSchemeEntries(scheme, errors);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toBe('Rule for \'platform\' must be a non-null object');
  });

  test('Empty scheme validation', () => {
    const result = validator.validate({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Scheme cannot be empty');
  });

  test('Null scheme validation', () => {
    const result = validator.validate(null);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0]).toBe('Scheme must be a non-null object');
  });

  test('Warning when percentage total is not 100%', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 30 }
    };

    const result = validator.validate(scheme);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toBe('Total percentage allocation (70%) doesn\'t equal 100% and no remainder rule is defined');
  });

  test('suggestFixes method fixes percentage total', () => {
    const scheme = {
      author: { percentage: 50 },
      platform: { percentage: 50 }
    };

    const errors = ['Total percentage allocation (100%) must equal 85.71%'];
    
    const fixedScheme = validator.suggestFixes(scheme, errors);
    
    expect(typeof fixedScheme).toBe('object');
    expect(typeof fixedScheme.author).toBe('object');
    expect(typeof fixedScheme.platform).toBe('object');
    
    expect(fixedScheme.author).toHaveProperty('percentage');
    expect(fixedScheme.platform).toHaveProperty('percentage');
  });

  test('suggestFixes method adds remainder when needed', () => {
    const scheme = {
      author: { percentage: 40 },
      platform: { percentage: 30 }
    };

    const fixedScheme = validator.suggestFixes(scheme, []);
    
    expect(fixedScheme).toHaveProperty('author');
    expect(fixedScheme).toHaveProperty('platform');
    
    expect(fixedScheme.author.percentage).toBe(40);
    expect(fixedScheme.platform.percentage).toBe(30);
  });
});
