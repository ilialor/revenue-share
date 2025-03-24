/**
 * @fileoverview Tests for the PayoutCalculator core class
 * @author RevShare Library
 * @version 1.0.0
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
});
