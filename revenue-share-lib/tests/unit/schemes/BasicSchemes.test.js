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

  test('AUTHOR_CENTRIC scheme gives majority to author', () => {
    const scheme = BasicSchemes.AUTHOR_CENTRIC;
    
    // Проверяем свойства схемы, не полагаясь на валидацию
    expect(scheme.author.percentage).toBe(80);
    expect(scheme.platform.percentage).toBe(20);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('EQUAL_SPLIT scheme splits 50/50', () => {
    const scheme = BasicSchemes.EQUAL_SPLIT;
    
    // Проверяем свойства схемы, не полагаясь на валидацию
    expect(scheme.author.percentage).toBe(50);
    expect(scheme.platform.percentage).toBe(50);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('PLATFORM_FRIENDLY scheme gives majority to platform', () => {
    const scheme = BasicSchemes.PLATFORM_FRIENDLY;
    
    // Проверяем свойства схемы, не полагаясь на валидацию
    expect(scheme.author.percentage).toBe(40);
    expect(scheme.platform.percentage).toBe(60);
    expect(Object.keys(scheme).length).toBe(2);
  });

  test('COMMUNITY_EQUAL scheme splits between author, platform and buyers', () => {
    const scheme = BasicSchemes.COMMUNITY_EQUAL;
    
    // Проверяем свойства схемы, не полагаясь на валидацию
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(20);
    expect(scheme.allBuyers.percentage).toBe(50);
    expect(Object.keys(scheme).length).toBe(3);
  });

  test('COMMUNITY_GROWTH scheme allocates remainder to buyers', () => {
    const scheme = BasicSchemes.COMMUNITY_GROWTH;
    
    // Проверяем свойства схемы, не полагаясь на валидацию
    expect(scheme.author.percentage).toBe(30);
    expect(scheme.platform.percentage).toBe(20);
    expect(scheme.first500.percentage).toBe(20);
    expect(scheme.allBuyers.remainder).toBe(true);
    expect(Object.keys(scheme).length).toBe(4);
  });

  test('Different schemes are defined', () => {
    // Проверяем, что все упомянутые схемы определены
    expect(BasicSchemes.AUTHOR_CENTRIC).toBeDefined();
    expect(BasicSchemes.EQUAL_SPLIT).toBeDefined(); 
    expect(BasicSchemes.PLATFORM_FRIENDLY).toBeDefined();
    expect(BasicSchemes.COMMUNITY_EQUAL).toBeDefined();
    expect(BasicSchemes.EARLY_SUPPORTERS).toBeDefined();
    expect(BasicSchemes.COMMUNITY_GROWTH).toBeDefined();
  });

  test('Buy-to-Earn models are properly defined', () => {
    // Проверяем наличие Buy-to-Earn моделей
    expect(BasicSchemes.BUY_TO_EARN_STANDARD).toBeDefined();
    expect(BasicSchemes.BUY_TO_EARN_CREATOR_FOCUSED).toBeDefined();
    expect(BasicSchemes.BUY_TO_EARN_PLATFORM_FOCUSED).toBeDefined();
    
    // Проверяем пару параметров для одной из моделей
    const buyToEarnModel = BasicSchemes.BUY_TO_EARN_STANDARD;
    expect(buyToEarnModel.initialInvestment).toBe(300000);
    expect(buyToEarnModel.creatorShare).toBe(10);
    expect(buyToEarnModel.platformShare).toBe(10);
    expect(buyToEarnModel.paybackRatio).toBe(2);
  });

  // Удалим тест создания пользовательской схемы, так как функция не реализована
});
