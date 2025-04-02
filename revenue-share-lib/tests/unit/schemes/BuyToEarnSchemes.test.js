/**
 * @fileoverview Tests for the BuyToEarnSchemes module
 * @author RevShare Library
 * @version 2.0.0
 */

import * as BuyToEarnSchemes from '../../../src/schemes/BuyToEarnSchemes';
import SchemeValidator from '../../../src/core/SchemeValidator';

describe('BuyToEarnSchemes', () => {
  let validator;

  beforeEach(() => {
    validator = new SchemeValidator();
  });

  test('STANDARD scheme has correct properties', () => {
    const scheme = BuyToEarnSchemes.STANDARD;
    
    // Проверка структуры схемы
    expect(scheme.initialInvestment).toBe(300000);
    expect(scheme.creatorShare).toBe(10);
    expect(scheme.platformShare).toBe(10);
    expect(scheme.promotionShare).toBe(10);
    expect(scheme.paybackRatio).toBe(2);
    expect(scheme.nonPaybackPoolSharePercent).toBe(60);
    
    // Проверка, что доли не превышают 100%
    expect(scheme.creatorShare + scheme.platformShare + scheme.promotionShare).toBeLessThanOrEqual(100);
  });

  test('CREATOR_FOCUSED scheme prioritizes creator', () => {
    const scheme = BuyToEarnSchemes.CREATOR_FOCUSED;
    
    // Проверка структуры схемы
    expect(scheme.creatorShare).toBe(20); // Повышенная доля создателя
    expect(scheme.platformShare).toBe(10);
    expect(scheme.promotionShare).toBe(5);
    
    // Доля создателя должна быть выше, чем в STANDARD
    expect(scheme.creatorShare).toBeGreaterThan(BuyToEarnSchemes.STANDARD.creatorShare);
  });

  test('PLATFORM_FOCUSED scheme prioritizes platform', () => {
    const scheme = BuyToEarnSchemes.PLATFORM_FOCUSED;
    
    // Проверка структуры схемы
    expect(scheme.platformShare).toBe(20); // Повышенная доля платформы
    expect(scheme.creatorShare).toBe(10);
    expect(scheme.promotionShare).toBe(5);
    
    // Доля платформы должна быть выше, чем в STANDARD
    expect(scheme.platformShare).toBeGreaterThan(BuyToEarnSchemes.STANDARD.platformShare);
  });

  test('EARLY_PAYBACK scheme prioritizes non-payback pool', () => {
    const scheme = BuyToEarnSchemes.EARLY_PAYBACK;
    
    // Проверка структуры схемы
    expect(scheme.nonPaybackPoolSharePercent).toBe(95); // Высокий приоритет для неокупившихся токенов
    
    // Доля неокупившихся должна быть выше, чем в STANDARD
    expect(scheme.nonPaybackPoolSharePercent).toBeGreaterThan(BuyToEarnSchemes.STANDARD.nonPaybackPoolSharePercent);
  });

  test('EQUAL_DISTRIBUTION scheme has low non-payback pool share', () => {
    const scheme = BuyToEarnSchemes.EQUAL_DISTRIBUTION;
    
    // Проверка структуры схемы
    expect(scheme.nonPaybackPoolSharePercent).toBe(25); // Низкий приоритет для неокупившихся токенов
    
    // Доля неокупившихся должна быть ниже, чем в STANDARD
    expect(scheme.nonPaybackPoolSharePercent).toBeLessThan(BuyToEarnSchemes.STANDARD.nonPaybackPoolSharePercent);
  });

  test('HIGH_PAYBACK scheme has higher payback goal', () => {
    const scheme = BuyToEarnSchemes.HIGH_PAYBACK;
    
    // Проверка структуры схемы
    expect(scheme.paybackRatio).toBe(3); // Повышенный множитель окупаемости
    
    // Множитель окупаемости должен быть выше, чем в STANDARD
    expect(scheme.paybackRatio).toBeGreaterThan(BuyToEarnSchemes.STANDARD.paybackRatio);
  });

  test('PROMOTION_FOCUSED scheme prioritizes promotion', () => {
    const scheme = BuyToEarnSchemes.PROMOTION_FOCUSED;
    
    // Проверка структуры схемы
    expect(scheme.promotionShare).toBe(25); // Повышенная доля на продвижение
    
    // Доля продвижения должна быть выше, чем в STANDARD
    expect(scheme.promotionShare).toBeGreaterThan(BuyToEarnSchemes.STANDARD.promotionShare);
  });

  test('SMALL_INVESTMENT scheme has lower initial investment', () => {
    const scheme = BuyToEarnSchemes.SMALL_INVESTMENT;
    
    // Проверка структуры схемы
    expect(scheme.initialInvestment).toBe(100000); // Меньшая начальная инвестиция
    
    // Начальная инвестиция должна быть ниже, чем в STANDARD
    expect(scheme.initialInvestment).toBeLessThan(BuyToEarnSchemes.STANDARD.initialInvestment);
  });

  test('LARGE_INVESTMENT scheme has higher initial investment', () => {
    const scheme = BuyToEarnSchemes.LARGE_INVESTMENT;
    
    // Проверка структуры схемы
    expect(scheme.initialInvestment).toBe(500000); // Большая начальная инвестиция
    
    // Начальная инвестиция должна быть выше, чем в STANDARD
    expect(scheme.initialInvestment).toBeGreaterThan(BuyToEarnSchemes.STANDARD.initialInvestment);
  });

  test('QUICK_PAYBACK scheme has lower payback ratio', () => {
    const scheme = BuyToEarnSchemes.QUICK_PAYBACK;
    
    // Проверка структуры схемы
    expect(scheme.paybackRatio).toBe(1.5); // Низкий множитель окупаемости
    expect(scheme.nonPaybackPoolSharePercent).toBe(90); // Высокий приоритет для неокупившихся токенов
    
    // Множитель окупаемости должен быть ниже, чем в STANDARD
    expect(scheme.paybackRatio).toBeLessThan(BuyToEarnSchemes.STANDARD.paybackRatio);
  });

  test('BUYER_FOCUSED scheme has lower other shares', () => {
    const scheme = BuyToEarnSchemes.BUYER_FOCUSED;
    
    // Проверка структуры схемы
    expect(scheme.creatorShare).toBe(8); // Пониженная доля создателя
    expect(scheme.platformShare).toBe(8);
    expect(scheme.promotionShare).toBe(8);
    
    // Доля покупателей должна быть выше, чем в STANDARD
    const buyerShareStandard = 100 - BuyToEarnSchemes.STANDARD.creatorShare - 
                               BuyToEarnSchemes.STANDARD.platformShare - 
                               BuyToEarnSchemes.STANDARD.promotionShare;
    
    const buyerShareBuyerFocused = 100 - scheme.creatorShare - scheme.platformShare - scheme.promotionShare;
    
    expect(buyerShareBuyerFocused).toBeGreaterThan(buyerShareStandard);
  });

  test('createCustomScheme creates valid schemes', () => {
    const customScheme = BuyToEarnSchemes.createCustomScheme({
      initialInvestment: 400000,
      creatorShare: 15,
      platformShare: 15,
      promotionShare: 15,
      paybackRatio: 2.5,
      nonPaybackPoolSharePercent: 70
    });
    
    // Проверка структуры схемы
    expect(customScheme.initialInvestment).toBe(400000);
    expect(customScheme.creatorShare).toBe(15);
    expect(customScheme.platformShare).toBe(15);
    expect(customScheme.promotionShare).toBe(15);
    expect(customScheme.paybackRatio).toBe(2.5);
    expect(customScheme.nonPaybackPoolSharePercent).toBe(70);
  });

  test('createCustomScheme with defaults', () => {
    // Вызов без параметров должен использовать значения по умолчанию
    const defaultScheme = BuyToEarnSchemes.createCustomScheme();
    
    // Проверка значений по умолчанию
    expect(defaultScheme.initialInvestment).toBe(300000);
    expect(defaultScheme.creatorShare).toBe(10);
    expect(defaultScheme.platformShare).toBe(10);
    expect(defaultScheme.promotionShare).toBe(10);
    expect(defaultScheme.paybackRatio).toBe(2);
    expect(defaultScheme.nonPaybackPoolSharePercent).toBe(60);
  });

  test('createCustomScheme validates inputs', () => {
    // Проверка на некорректные параметры
    
    // Отрицательная начальная инвестиция
    expect(() => BuyToEarnSchemes.createCustomScheme({
      initialInvestment: -10000
    })).toThrow();
    
    // Отрицательная доля
    expect(() => BuyToEarnSchemes.createCustomScheme({
      creatorShare: -10
    })).toThrow();
    
    // Сумма долей > 100%
    expect(() => BuyToEarnSchemes.createCustomScheme({
      creatorShare: 40,
      platformShare: 40,
      promotionShare: 30
    })).toThrow();
    
    // Множитель окупаемости < 1
    expect(() => BuyToEarnSchemes.createCustomScheme({
      paybackRatio: 0.5
    })).toThrow();
    
    // nonPaybackPoolSharePercent вне диапазона [0, 100]
    expect(() => BuyToEarnSchemes.createCustomScheme({
      nonPaybackPoolSharePercent: 110
    })).toThrow();
  });

  test('getSchemeByName returns correct scheme', () => {
    const scheme = BuyToEarnSchemes.getSchemeByName('STANDARD');
    
    // Проверка, что возвращена правильная схема
    expect(scheme).toBe(BuyToEarnSchemes.STANDARD);
    
    // Несуществующая схема
    expect(BuyToEarnSchemes.getSchemeByName('NON_EXISTENT')).toBe(null);
  });

  test('getAllSchemeNames returns all scheme names', () => {
    const schemeNames = BuyToEarnSchemes.getAllSchemeNames();
    
    // Проверка наличия всех схем
    expect(schemeNames).toContain('STANDARD');
    expect(schemeNames).toContain('CREATOR_FOCUSED');
    expect(schemeNames).toContain('PLATFORM_FOCUSED');
    expect(schemeNames).toContain('EARLY_PAYBACK');
    expect(schemeNames).toContain('EQUAL_DISTRIBUTION');
    expect(schemeNames).toContain('HIGH_PAYBACK');
    expect(schemeNames).toContain('PROMOTION_FOCUSED');
    expect(schemeNames).toContain('SMALL_INVESTMENT');
    expect(schemeNames).toContain('LARGE_INVESTMENT');
    expect(schemeNames).toContain('QUICK_PAYBACK');
    expect(schemeNames).toContain('BUYER_FOCUSED');
  });

  test('getAllSchemesWithMetadata returns schemes with additional data', () => {
    const schemesWithMeta = BuyToEarnSchemes.getAllSchemesWithMetadata();
    
    // Проверка первой схемы в массиве
    const firstScheme = schemesWithMeta[0];
    
    // Проверка наличия метаданных
    expect(firstScheme.name).toBeDefined();
    expect(firstScheme.scheme).toBeDefined();
    expect(firstScheme.buyersShare).toBeDefined();
    expect(firstScheme.paybackPoolSharePercent).toBeDefined();
    
    // Проверка правильного расчета дополнительных полей
    expect(firstScheme.buyersShare).toBe(
      100 - firstScheme.scheme.creatorShare - 
      firstScheme.scheme.platformShare - 
      firstScheme.scheme.promotionShare
    );
    
    expect(firstScheme.paybackPoolSharePercent).toBe(
      100 - firstScheme.scheme.nonPaybackPoolSharePercent
    );
  });
}); 