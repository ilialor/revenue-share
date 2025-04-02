/**
 * @fileoverview Tests for the RevenueSharing core class
 * @author RevShare Library
 * @version 1.0.0
 */

import RevenueSharing from '../../../src/core/RevenueSharing';

describe('RevenueSharing Core', () => {
  // Test 1: Simple scheme (author receives 100%)
  test('Author receives 100% of revenue', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    lib.addSale({ buyer: 'buyer1' });
    lib.addSale({ buyer: 'buyer2' });
    
    const payouts = lib.calculatePayouts();
    
    expect(payouts.author).toBe(200);
    expect(payouts.platform).toBe(0);
    expect(Object.values(payouts.buyers).every(val => val === 0)).toBe(true);
  });

  // Test 2: Fixed percentages with remainder to all buyers
  test('Fixed percentages with remainder to all buyers', () => {
    const scheme = {
      author: { percentage: 10 },
      platform: { percentage: 10 },
      allBuyers: { remainder: true }
    };
    
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    for (let i = 0; i < 10; i++) {
      lib.addSale({ buyer: `buyer${i}` });
    }
    
    const payouts = lib.calculatePayouts();
    
    expect(payouts.author).toBe(100);
    expect(payouts.platform).toBe(100);
    expect(Object.values(payouts.buyers).every(val => val === 80)).toBe(true);
  });

  // Test 3: Early buyers bonus
  test('Early buyers bonus', () => {
    const scheme = {
      author: { percentage: 10 },
      platform: { percentage: 10 },
      earlyBuyers: { count: 3, percentage: 10 },
      allBuyers: { remainder: true }
    };
    
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    for (let i = 0; i < 5; i++) {
      lib.addSale({ buyer: `buyer${i}` });
    }
    
    const payouts = lib.calculatePayouts();
    
    expect(payouts.author).toBe(50);
    expect(payouts.platform).toBe(50);
    expect(payouts.buyers['buyer0']).toBeCloseTo(16.67 + 70, 2);
    expect(payouts.buyers['buyer3']).toBeCloseTo(70, 2);
  });

  // Test 4: Sliding window scheme
  test('Sliding window scheme', () => {
    const scheme = {
      author: { percentage: 10 },
      platform: { percentage: 7 },
      first500: { count: 2, percentage: 5 },
      last5000: { count: 3, percentage: 70, fromEnd: true },
      allBuyers: { percentage: 8 }
    };
    
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    for (let i = 0; i < 10; i++) {
      lib.addSale({ buyer: `buyer${i}` });
    }
    
    const payouts = lib.calculatePayouts();
    
    expect(payouts.author).toBe(100);
    expect(payouts.platform).toBe(70);
    expect(payouts.buyers['buyer0']).toBeCloseTo(25 + 8, 2);
    expect(payouts.buyers['buyer9']).toBeCloseTo(233.33 + 8, 2);
    expect(payouts.buyers['buyer4']).toBe(8);
  });

  // Test 5: Zero sales
  test('Zero sales', () => {
    const scheme = {
      author: { percentage: 10 },
      allBuyers: { remainder: true }
    };
    
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    const payouts = lib.calculatePayouts();
    
    expect(payouts.author).toBe(0);
    expect(payouts.platform).toBe(0);
    expect(Object.keys(payouts.buyers).length).toBe(0);
  });

  // Test 6: Scheme validation
  test('Scheme validation', () => {
    const scheme = {
      author: { percentage: 60 },
      platform: { percentage: 50 }
    };
    
    expect(() => new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme,
      options: { validateScheme: true }
    })).toThrow('Invalid scheme: Total percentage allocation (110%) must equal 100%');
  });

  // Test 7: Bulk adding sales
  test('Bulk adding sales', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    const sales = [
      { buyer: 'buyer1' },
      { buyer: 'buyer2' },
      { buyer: 'buyer3' }
    ];
    
    lib.addSales(sales);
    
    const payouts = lib.calculatePayouts();
    expect(payouts.author).toBe(300);
  });

  // Test 8: Getting sales statistics
  test('Getting sales statistics', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'BestProduct',
      unitPrice: 50,
      scheme: scheme
    });
    
    lib.addSale({ buyer: 'buyer1' });
    lib.addSale({ buyer: 'buyer2' });
    lib.addSale({ buyer: 'buyer1' }); // Repeat purchase
    
    const stats = lib.getSalesStats();
    
    expect(stats.productName).toBe('BestProduct');
    expect(stats.unitPrice).toBe(50);
    expect(stats.totalSales).toBe(3);
    expect(stats.totalRevenue).toBe(150);
    expect(stats.uniqueBuyers).toBe(2);
  });

  // Test 9: Export and import data
  test('Export and import data', () => {
    const scheme = { author: { percentage: 100 } };
    const lib1 = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    lib1.addSale({ buyer: 'buyer1' });
    lib1.addSale({ buyer: 'buyer2' });
    
    const exportedData = lib1.exportData();
    
    const lib2 = new RevenueSharing({
      productName: 'DummyName',
      unitPrice: 0,
      scheme: { platform: { percentage: 100 } }
    });
    
    lib2.importData(exportedData);
    
    const payouts = lib2.calculatePayouts();
    expect(payouts.author).toBe(200);
    expect(lib2.productName).toBe('Product1');
    expect(lib2.unitPrice).toBe(100);
  });

  // Test 10: Rounding options in calculation
  test('Rounding options in calculation', () => {
    const scheme = {
      author: { percentage: 33.333 },
      platform: { percentage: 33.333 },
      allBuyers: { percentage: 33.334 }
    };
    
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });
    
    lib.addSale({ buyer: 'buyer1' });
    
    // With rounding (default)
    const roundedPayouts = lib.calculatePayouts();
    expect(roundedPayouts.author).toBe(33.33);
    
    // Without rounding
    const exactPayouts = lib.calculatePayouts({ roundResults: false });
    expect(exactPayouts.author).toBe(33.333);
  });

  // Test 11: Timestamp tracking
  test('Timestamp tracking', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme,
      options: { trackSaleTimestamp: true }
    });
    
    const timestamp1 = Date.now();
    lib.addSale({ buyer: 'buyer1', timestamp: timestamp1 });
    
    // Wait a bit to ensure different timestamps
    setTimeout(() => {
      const timestamp2 = Date.now();
      lib.addSale({ buyer: 'buyer2', timestamp: timestamp2 });
    }, 100);
    
    const stats = lib.getSalesStats();
    expect(stats.firstSaleDate).toBeInstanceOf(Date);
    expect(stats.lastSaleDate).toBeInstanceOf(Date);
    expect(stats.salesDuration).toBeGreaterThan(0);
  });

  // Test 12: Invalid initialization parameters
  test('Invalid initialization parameters', () => {
    expect(() => new RevenueSharing({
      productName: '',
      unitPrice: 100,
      scheme: { author: { percentage: 100 } }
    })).toThrow('Invalid scheme: Product name cannot be empty');

    expect(() => new RevenueSharing({
      productName: 'Product1',
      unitPrice: -100,
      scheme: { author: { percentage: 100 } }
    })).toThrow('Invalid scheme: Unit price must be a positive number');

    expect(() => new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: null
    })).toThrow('Invalid scheme: Scheme must be a non-null object');
  });

  // Test 13: Invalid sale data
  test('Invalid sale data', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'Product1',
      unitPrice: 100,
      scheme: scheme
    });

    expect(() => lib.addSale({})).toThrow('Buyer identifier is required for each sale');
    expect(() => lib.addSale({ buyer: null })).toThrow('Buyer identifier is required for each sale');
    expect(() => lib.addSale({ buyer: '' })).toThrow('Buyer identifier is required for each sale');

    expect(() => lib.addSales(null)).toThrow('Expected an array of sales');
    expect(() => lib.addSales('not an array')).toThrow('Expected an array of sales');
  });
});
