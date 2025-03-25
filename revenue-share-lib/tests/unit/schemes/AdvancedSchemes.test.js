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

  test('SlidingWindow scheme has properly defined sliding window groups', () => {
    const scheme = AdvancedSchemes.SLIDING_WINDOW;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(10);
    expect(scheme.platform.percentage).toBe(7);
    expect(scheme.first500).toBeDefined();
    expect(scheme.first500.count).toBe(500);
    expect(scheme.first500.percentage).toBe(5);
    expect(scheme.last5000).toBeDefined();
    expect(scheme.last5000.count).toBe(5000);
    expect(scheme.last5000.percentage).toBe(70);
    expect(scheme.last5000.fromEnd).toBe(true);
    expect(scheme.allBuyers.percentage).toBe(8);
  });

  test('EarlyAdopterTiers scheme includes multiple bonus tiers for early adopters', () => {
    const scheme = AdvancedSchemes.EARLY_ADOPTER_TIERS;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(20);
    expect(scheme.platform.percentage).toBe(15);
    expect(scheme.first100).toBeDefined();
    expect(scheme.first100.count).toBe(100);
    expect(scheme.first100.percentage).toBe(25);
    expect(scheme.first1000).toBeDefined();
    expect(scheme.first1000.count).toBe(1000);
    expect(scheme.first1000.percentage).toBe(20);
    expect(scheme.first10000).toBeDefined();
    expect(scheme.first10000.count).toBe(10000);
    expect(scheme.first10000.percentage).toBe(15);
    expect(scheme.allBuyers.percentage).toBe(5);
  });

  test('CreatorEconomy scheme emphasizes author rewards', () => {
    const scheme = AdvancedSchemes.CREATOR_ECONOMY;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(60);
    expect(scheme.platform.percentage).toBe(10);
    expect(scheme.first1000).toBeDefined();
    expect(scheme.first1000.count).toBe(1000);
    expect(scheme.first1000.percentage).toBe(20);
    expect(scheme.allBuyers.percentage).toBe(10);
  });

  test('CommunityDriven scheme has high buyer rewards', () => {
    const scheme = AdvancedSchemes.COMMUNITY_DRIVEN;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(15);
    expect(scheme.platform.percentage).toBe(10);
    expect(scheme.first5000).toBeDefined();
    expect(scheme.first5000.count).toBe(5000);
    expect(scheme.first5000.percentage).toBe(15);
    expect(scheme.allBuyers.percentage).toBe(60);
  });

  test('ICOModel scheme rewards early adopters', () => {
    const scheme = AdvancedSchemes.ICO_MODEL;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(15);
    expect(scheme.platform.percentage).toBe(10);
    expect(scheme.first100).toBeDefined();
    expect(scheme.first100.count).toBe(100);
    expect(scheme.first100.percentage).toBe(30);
    expect(scheme.first1000).toBeDefined();
    expect(scheme.first1000.count).toBe(1000);
    expect(scheme.first1000.percentage).toBe(25);
    expect(scheme.first10000).toBeDefined();
    expect(scheme.first10000.count).toBe(10000);
    expect(scheme.first10000.percentage).toBe(15);
    expect(scheme.allBuyers.percentage).toBe(5);
  });

  test('CrowdfundingModel scheme emphasizes author rewards', () => {
    const scheme = AdvancedSchemes.CROWDFUNDING_MODEL;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(75);
    expect(scheme.platform.percentage).toBe(15);
    expect(scheme.first1000).toBeDefined();
    expect(scheme.first1000.count).toBe(1000);
    expect(scheme.first1000.percentage).toBe(7);
    expect(scheme.allBuyers.percentage).toBe(3);
  });

  test('DynamicTiered scheme has different allocations for early and late buyers', () => {
    const scheme = AdvancedSchemes.DYNAMIC_TIERED;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(10);
    expect(scheme.first1000).toBeDefined();
    expect(scheme.first1000.count).toBe(1000);
    expect(scheme.first1000.percentage).toBe(10);
    expect(scheme.last1000).toBeDefined();
    expect(scheme.last1000.count).toBe(1000);
    expect(scheme.last1000.percentage).toBe(40);
    expect(scheme.last1000.fromEnd).toBe(true);
    expect(scheme.allBuyers.percentage).toBe(10);
  });

  test('PlatformGrowth scheme incentivizes the platform', () => {
    const scheme = AdvancedSchemes.PLATFORM_GROWTH;
    
    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);
    
    // Check scheme properties
    expect(scheme.author.percentage).toBe(25);
    expect(scheme.platform.percentage).toBe(45);
    expect(scheme.first500).toBeDefined();
    expect(scheme.first500.count).toBe(500);
    expect(scheme.first500.percentage).toBe(20);
    expect(scheme.allBuyers.percentage).toBe(10);
  });

  test('createCustomAdvancedScheme creates valid complex scheme', () => {
    const scheme = AdvancedSchemes.createCustomAdvancedScheme({
      authorPercentage: 30,
      platformPercentage: 20,
      earlyBuyersCount: 100,
      earlyBuyersPercentage: 25,
      lateBuyersCount: 500,
      lateBuyersPercentage: 15,
      allBuyersPercentage: 10
    });

    // Validate scheme structure
    const validationResult = validator.validate(scheme);
    expect(validationResult.isValid).toBe(true);

    // Check scheme properties
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(20);
    expect(scheme.earlyBuyers).toBeDefined();
    expect(scheme.earlyBuyers.count).toBe(100);
    expect(scheme.earlyBuyers.percentage).toBe(25);
    expect(scheme.lateBuyers).toBeDefined();
    expect(scheme.lateBuyers.count).toBe(500);
    expect(scheme.lateBuyers.percentage).toBe(15);
    expect(scheme.allBuyers.percentage).toBe(10);
  });
});
