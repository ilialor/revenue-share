/**
 * @fileoverview Tests for the BasicSchemes module
 * @author RevShare Library
 * @version 1.0.0
 */

import * as BasicSchemes from '../../../src/schemes/BasicSchemes';
import SchemeValidator from '../../../src/core/SchemeValidator';

describe('BasicSchemes', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemeValidator();
  });

  test('AuthorAll scheme gives 100% to author', () => {
    const scheme = BasicSchemes.AuthorAll;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(100);
    expect(Object.keys(scheme).length).toBe(1);
  });

  test('AuthorPlatformEqual scheme splits 50/50', () => {
    const scheme = BasicSchemes.AuthorPlatformEqual;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(50);
    expect(scheme.platform.percentage).toBe(50);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('PlatformMajority scheme gives majority to platform', () => {
    const scheme = BasicSchemes.PlatformMajority;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(70);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('AuthorMajority scheme gives majority to author', () => {
    const scheme = BasicSchemes.AuthorMajority;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(70);
    expect(scheme.platform.percentage).toBe(30);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('AuthorPlatformBuyers scheme splits between all three', () => {
    const scheme = BasicSchemes.AuthorPlatformBuyers;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.allBuyers.percentage).toBe(30);
    expect(Object.keys(scheme).length).toBe(3);
  });

  test('AuthorPlatformRemainderToBuyers scheme allocates remainder to buyers', () => {
    const scheme = BasicSchemes.AuthorPlatformRemainderToBuyers;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.allBuyers.remainder).toBe(true);
    expect(Object.keys(scheme).length).toBe(3);
  });

  test('All exported schemes are valid', () => {
    // Check all exported schemes
    const schemes = Object.values(BasicSchemes);
    
    for (const scheme of schemes) {
      const validationResult = validator.validate(scheme);
      expect(validationResult.isValid).toBe(true);
    }
  });

  test('createCustomBasicScheme creates valid schemes', () => {
    const customScheme = BasicSchemes.createCustomBasicScheme(60, 40);
    
    // Validate scheme structure
    const validationResult = validator.validate(customScheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(customScheme.author.percentage).toBe(60);
    expect(customScheme.platform.percentage).toBe(40);
  });

  test('createCustomBasicScheme validates inputs', () => {
    // Test with invalid percentages (> 100)
    expect(() => BasicSchemes.createCustomBasicScheme(60, 50)).toThrow();
    
    // Test with negative percentages
    expect(() => BasicSchemes.createCustomBasicScheme(-10, 50)).toThrow();
  });
});
