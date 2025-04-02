/**
 * @fileoverview Tests for the PayoutCalculator core class
 * @author RevShare Library
 * @version 2.0.0
 */

import PayoutCalculator from '../../../src/core/PayoutCalculator';

describe('PayoutCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new PayoutCalculator();
  });

  test('Basic calculation with fixed percentages', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 }
      ],
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 100,
      totalRevenue: 200
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(140);
    expect(payouts.platform).toBe(60);
    expect(Object.keys(payouts.buyers).length).toBe(2);
    expect(Object.values(payouts.buyers).every(val => val === 0)).toBe(true);
  });

  test('Calculation with all buyers allocation', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 }
      ],
      scheme: {
        author: { percentage: 40 },
        platform: { percentage: 30 },
        allBuyers: { percentage: 30 }
      },
      unitPrice: 100,
      totalRevenue: 200
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(80);
    expect(payouts.platform).toBe(60);
    expect(payouts.buyers.buyer1).toBe(30);
    expect(payouts.buyers.buyer2).toBe(30);
  });

  test('Calculation with early buyers group', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 },
        { buyer: 'buyer3', timestamp: 3000 },
        { buyer: 'buyer4', timestamp: 4000 }
      ],
      scheme: {
        author: { percentage: 40 },
        platform: { percentage: 30 },
        earlyBuyers: { count: 2, percentage: 30 }
      },
      unitPrice: 100,
      totalRevenue: 400
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(160);
    expect(payouts.platform).toBe(120);
    expect(payouts.buyers.buyer1).toBe(60);
    expect(payouts.buyers.buyer2).toBe(60);
    expect(payouts.buyers.buyer3).toBe(0);
    expect(payouts.buyers.buyer4).toBe(0);
  });

  test('Calculation with late buyers group', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 },
        { buyer: 'buyer3', timestamp: 3000 },
        { buyer: 'buyer4', timestamp: 4000 }
      ],
      scheme: {
        author: { percentage: 40 },
        platform: { percentage: 30 },
        lateBuyers: { count: 2, percentage: 30, fromEnd: true }
      },
      unitPrice: 100,
      totalRevenue: 400
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(160);
    expect(payouts.platform).toBe(120);
    expect(payouts.buyers.buyer1).toBe(0);
    expect(payouts.buyers.buyer2).toBe(0);
    expect(payouts.buyers.buyer3).toBe(60);
    expect(payouts.buyers.buyer4).toBe(60);
  });

  test('Calculation with remainder allocation', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 }
      ],
      scheme: {
        author: { percentage: 30 },
        platform: { percentage: 20 },
        allBuyers: { remainder: true }
      },
      unitPrice: 100,
      totalRevenue: 200
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(60);
    expect(payouts.platform).toBe(40);
    expect(payouts.buyers.buyer1).toBe(50);
    expect(payouts.buyers.buyer2).toBe(50);
  });

  test('Calculation with combined rules', () => {
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 },
        { buyer: 'buyer3', timestamp: 3000 },
        { buyer: 'buyer4', timestamp: 4000 }
      ],
      scheme: {
        author: { percentage: 30 },
        platform: { percentage: 20 },
        earlyBuyers: { count: 1, percentage: 10 },
        lateBuyers: { count: 1, percentage: 20, fromEnd: true },
        allBuyers: { percentage: 20 }
      },
      unitPrice: 100,
      totalRevenue: 400
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(120);
    expect(payouts.platform).toBe(80);
    expect(payouts.buyers.buyer1).toBe(40 + 20); // early bonus + all buyers share
    expect(payouts.buyers.buyer4).toBe(80 + 20); // late bonus + all buyers share
    expect(payouts.buyers.buyer2).toBe(20); // only all buyers share
    expect(payouts.buyers.buyer3).toBe(20); // only all buyers share
  });

  test('Calculation with no sales', () => {
    const data = {
      sales: [],
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 100,
      totalRevenue: 0
    };

    const payouts = calculator.calculate(data);
    
    expect(payouts.author).toBe(0);
    expect(payouts.platform).toBe(0);
    expect(Object.keys(payouts.buyers).length).toBe(0);
  });

  test('Custom calculator function', () => {
    const customCalc = (data, basePayouts) => {
      // Double the author's share at the expense of the platform
      const authorExtra = Math.min(basePayouts.platform, basePayouts.author);
      return {
        ...basePayouts,
        author: basePayouts.author + authorExtra,
        platform: basePayouts.platform - authorExtra
      };
    };

    const customCalculator = calculator.createCustomCalculator(customCalc);
    
    const data = {
      sales: [
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer2', timestamp: 2000 }
      ],
      scheme: {
        author: { percentage: 40 },
        platform: { percentage: 60 }
      },
      unitPrice: 100,
      totalRevenue: 200
    };

    const payouts = customCalculator(data);
    
    expect(payouts.author).toBe(80 + 80); // Original + extra
    expect(payouts.platform).toBe(120 - 80); // Original - extra
  });

  test('Calculation with unsorted timestamps', () => {
    const data = {
      sales: [
        { buyer: 'buyer2', timestamp: 2000 },
        { buyer: 'buyer1', timestamp: 1000 },
        { buyer: 'buyer4', timestamp: 4000 },
        { buyer: 'buyer3', timestamp: 3000 }
      ],
      scheme: {
        author: { percentage: 40 },
        platform: { percentage: 30 },
        earlyBuyers: { count: 2, percentage: 30 }
      },
      unitPrice: 100,
      totalRevenue: 400
    };

    const payouts = calculator.calculate(data);
    
    // Ensure timestamps were properly sorted
    expect(payouts.author).toBe(160);
    expect(payouts.platform).toBe(120);
    expect(payouts.buyers.buyer1).toBe(60);
    expect(payouts.buyers.buyer2).toBe(60);
    expect(payouts.buyers.buyer3).toBe(0);
    expect(payouts.buyers.buyer4).toBe(0);
  });

  // ----- Тесты для Buy-to-Earn модели -----

  test('Buy-to-Earn basic calculation', () => {
    const data = {
      sales: Array(2000).fill().map((_, i) => ({ 
        buyer: `buyer${i+1}`, 
        timestamp: 1000 + i 
      })),
      unitPrice: 500,
      buyToEarnParams: {
        initialInvestment: 300000,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10,
        paybackRatio: 2,
        nonPaybackPoolSharePercent: 60,
        specificTokenNumber: 100
      }
    };

    const payouts = calculator.calculateBuyToEarnPayouts(data);
    
    // Проверка основных параметров
    expect(payouts.creator).toBeGreaterThan(300000); // Создатель должен получить минимум initialInvestment
    expect(payouts.platform).toBeGreaterThan(0);
    expect(payouts.promotion).toBeGreaterThan(0);
    expect(payouts.buyer).toBeGreaterThan(0);
    
    // Проверка правильности данных окупаемости
    expect(payouts.prepayersCount).toBe(600); // 300000 / 500 = 600
    expect(payouts.paybackGoal).toBe(1000); // 500 * 2 = 1000
    expect(payouts.paidBackCount).toBeGreaterThan(0);
  });

  test('Buy-to-Earn with too few sales', () => {
    const data = {
      sales: Array(500).fill().map((_, i) => ({ 
        buyer: `buyer${i+1}`, 
        timestamp: 1000 + i 
      })),
      unitPrice: 500,
      buyToEarnParams: {
        initialInvestment: 300000,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10,
        paybackRatio: 2,
        nonPaybackPoolSharePercent: 60,
        specificTokenNumber: 100
      }
    };

    const payouts = calculator.calculateBuyToEarnPayouts(data);
    
    // Проверка основных параметров для случая недостаточного количества продаж
    expect(payouts.creator).toBe(300000); // Создатель получает только initialInvestment
    expect(payouts.platform).toBe(0);
    expect(payouts.promotion).toBe(0);
    expect(payouts.buyer).toBe(0);
    expect(payouts.prepayersCount).toBe(600); // 300000 / 500 = 600
    expect(payouts.paidBackCount).toBe(0);
    expect(payouts.paybackPoint).toBe(null);
  });

  test('Buy-to-Earn token payback estimation', () => {
    const params = {
      tokenNumber: 100,
      tokenPrice: 500,
      paybackRatio: 2,
      nonPaybackPoolPercent: 0.6,
      buyersShare: 0.7
    };

    const estimation = calculator.estimateTokenPayback(params);
    
    // Проверка результата оценки
    expect(estimation.paybackSale).toBeGreaterThan(100); // Точка окупаемости должна быть после номера токена
    expect(estimation.accumulatedEarnings).toBe(1000); // Цель окупаемости 500 * 2 = 1000
    expect(parseFloat(estimation.roi)).toBe(100); // ROI при окупаемости 2x = 100%
  });

  test('Buy-to-Earn with different priority settings', () => {
    // Создаем два набора данных с разными приоритетами
    const data1 = {
      sales: Array(2000).fill().map((_, i) => ({ 
        buyer: `buyer${i+1}`, 
        timestamp: 1000 + i 
      })),
      unitPrice: 500,
      buyToEarnParams: {
        initialInvestment: 300000,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10,
        paybackRatio: 2,
        nonPaybackPoolSharePercent: 90, // Высокий приоритет для неокупившихся
        specificTokenNumber: 100
      }
    };

    const data2 = {
      sales: Array(2000).fill().map((_, i) => ({ 
        buyer: `buyer${i+1}`, 
        timestamp: 1000 + i 
      })),
      unitPrice: 500,
      buyToEarnParams: {
        initialInvestment: 300000,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10,
        paybackRatio: 2,
        nonPaybackPoolSharePercent: 30, // Низкий приоритет для неокупившихся
        specificTokenNumber: 100
      }
    };

    const payouts1 = calculator.calculateBuyToEarnPayouts(data1);
    const payouts2 = calculator.calculateBuyToEarnPayouts(data2);
    
    // Для высокого приоритета неокупившихся токенов окупаемость должна наступить раньше
    expect(payouts1.paybackPoint || Infinity).toBeLessThan(payouts2.paybackPoint || Infinity);
  });

  test('Buy-to-Earn payback tracking', () => {
    // Тестируем трекинг окупаемости для нескольких токенов
    const data = {
      sales: Array(3000).fill().map((_, i) => ({ 
        buyer: `buyer${i+1}`, 
        timestamp: 1000 + i 
      })),
      unitPrice: 500,
      buyToEarnParams: {
        initialInvestment: 300000,
        creatorShare: 10,
        platformShare: 10,
        promotionShare: 10,
        paybackRatio: 2,
        nonPaybackPoolSharePercent: 60
      }
    };

    // Проверяем токены разных "волн"
    const earlyToken = calculator.calculateBuyToEarnPayouts({
      ...data,
      buyToEarnParams: {
        ...data.buyToEarnParams,
        specificTokenNumber: 50 // Ранний токен
      }
    });

    const midToken = calculator.calculateBuyToEarnPayouts({
      ...data,
      buyToEarnParams: {
        ...data.buyToEarnParams,
        specificTokenNumber: 300 // Средний токен
      }
    });

    const lateToken = calculator.calculateBuyToEarnPayouts({
      ...data,
      buyToEarnParams: {
        ...data.buyToEarnParams,
        specificTokenNumber: 550 // Поздний токен
      }
    });

    // Ранние токены должны окупаться раньше
    expect(earlyToken.paybackPoint).toBeLessThan(midToken.paybackPoint || Infinity);
    expect(midToken.paybackPoint || Infinity).toBeLessThan(lateToken.paybackPoint || Infinity);
  });
});
