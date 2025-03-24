/**
 * @fileoverview Tests for the AdvancedSchemes module
 * @author RevShare Library
 * @version 1.0.0
 */

import * as AdvancedSchemes from '../../../src/schemes/AdvancedSchemes';
import SchemeValidator from '../../../src/core/SchemeValidator';

describe('AdvancedSchemes', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemeValidator();
  });

  test('EarlyBuyersBonus scheme includes bonus for early buyers', () => {
    const scheme = AdvancedSchemes.EarlyBuyersBonus;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.earlyBuyers).toBeDefined();
    expect(scheme.earlyBuyers.count).toBeGreaterThan(0);
    expect(scheme.earlyBuyers.percentage).toBeGreaterThan(0);
    expect(scheme.allBuyers.percentage).toBeGreaterThan(0);
  });

  test('LateBuyersBonus scheme includes bonus for late buyers', () => {
    const scheme = AdvancedSchemes.LateBuyersBonus;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.lateBuyers).toBeDefined();
    expect(scheme.lateBuyers.count).toBeGreaterThan(0);
    expect(scheme.lateBuyers.percentage).toBeGreaterThan(0);
    expect(scheme.lateBuyers.fromEnd).toBe(true);
    expect(scheme.allBuyers.percentage).toBeGreaterThan(0);
  });

  test('EarlyLateBuyersBonus scheme includes bonus for early and late buyers', () => {
    const scheme = AdvancedSchemes.EarlyLateBuyersBonus;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(20);
    expect(scheme.earlyBuyers).toBeDefined();
    expect(scheme.earlyBuyers.count).toBeGreaterThan(0);
    expect(scheme.earlyBuyers.percentage).toBeGreaterThan(0);
    expect(scheme.lateBuyers).toBeDefined();
    expect(scheme.lateBuyers.count).toBeGreaterThan(0);
    expect(scheme.lateBuyers.percentage).toBeGreaterThan(0);
    expect(scheme.lateBuyers.fromEnd).toBe(true);
    expect(scheme.allBuyers.percentage).toBeGreaterThan(0);
  });

  test('SlidingWindow scheme has properly defined sliding window groups', () => {
    const scheme = AdvancedSchemes.SlidingWindow;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBeGreaterThan(0);
    expect(scheme.platform.percentage).toBeGreaterThan(0);
    
    // Check for existence of buyer groups with counts
    const buyerGroups = Object.keys(scheme).filter(key => 
      key !== 'author' && key !== 'platform' && key !== 'allBuyers'
    );
    
    expect(buyerGroups.length).toBeGreaterThan(0);
    
    for (const group of buyerGroups) {
      expect(scheme[group].count).toBeGreaterThan(0);
      expect(scheme[group].percentage).toBeGreaterThan(0);
    }
    
    // At least one group should be fromEnd
    const hasFromEndGroup = buyerGroups.some(group => scheme[group].fromEnd === true);
    expect(hasFromEndGroup).toBe(true);
  });

  test('createEarlyBuyersScheme creates valid scheme with early buyers', () => {
    const earlyCount = 100;
    const earlyPercentage = 20;
    const scheme = AdvancedSchemes.createEarlyBuyersScheme(earlyCount, earlyPercentage, 40, 30);
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.earlyBuyers.count).toBe(earlyCount);
    expect(scheme.earlyBuyers.percentage).toBe(earlyPercentage);
    expect(scheme.allBuyers.remainder).toBe(true);
  });

  test('createLateBuyersScheme creates valid scheme with late buyers', () => {
    const lateCount = 50;
    const latePercentage = 15;
    const scheme = AdvancedSchemes.createLateBuyersScheme(lateCount, latePercentage, 40, 30);
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(30);
    expect(scheme.lateBuyers.count).toBe(lateCount);
    expect(scheme.lateBuyers.percentage).toBe(latePercentage);
    expect(scheme.lateBuyers.fromEnd).toBe(true);
    expect(scheme.allBuyers.remainder).toBe(true);
  });

  test('createCustomAdvancedScheme creates valid complex scheme', () => {
    const scheme = AdvancedSchemes.createCustomAdvancedScheme({
      authorPercentage: 30,
      platformPercentage: 20,
      earlyBuyersCount: 100,
      earlyBuyersPercentage: 10,
      lateBuyersCount: 200,
      lateBuyersPercentage: 25,
      allBuyersPercentage: 15
    });
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(20);
    expect(scheme.earlyBuyers.count).toBe(100);
    expect(scheme.earlyBuyers.percentage).toBe(10);
    expect(scheme.lateBuyers.count).toBe(200);
    expect(scheme.lateBuyers.percentage).toBe(25);
    expect(scheme.lateBuyers.fromEnd).toBe(true);
    expect(scheme.allBuyers.percentage).toBe(15);
  });

  test('createCustomAdvancedScheme validates total percentage', () => {
    // Test with percentages totaling > 100%
    expect(() => AdvancedSchemes.createCustomAdvancedScheme({
      authorPercentage: 40,
      platformPercentage: 30,
      earlyBuyersCount: 100,
      earlyBuyersPercentage: 20,
      lateBuyersCount: 200,
      lateBuyersPercentage: 20,
      allBuyersPercentage: 0
    })).toThrow();
  });

  test('All exported schemes are valid', () => {
    // Get all exported schemes that are objects (not functions)
    const schemes = Object.entries(AdvancedSchemes)
      .filter(([_, value]) => typeof value === 'object')
      .map(([_, value]) => value);
    
    for (const scheme of schemes) {
      const validationResult = validator.validate(scheme);
      expect(validationResult.isValid).toBe(true);
    }
  });
});
