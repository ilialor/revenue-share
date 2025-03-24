/**
 * @fileoverview Tests for the RevenueSharing core class
 * @author RevShare Library
 * @version 1.0.0
 */

// Import the RevenueSharing class
// Note: In a real project, you'd import from the built files or use path aliases
// For now, we'll use a relative path for testing
import RevenueSharing from '../../../src/core/RevenueSharing';

describe('RevenueSharing Core', () => {
  // Тест 1: Простая схема (автор получает 100%)
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

  // Тест 2: Фиксированные проценты и остаток покупателям
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

  // Тест 3: Схема с группой ранних покупателей
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

  // Тест 4: Схема "скользящего окна"
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
    expect(payouts.buyers['buyer0']).toBeCloseTo(25 + 8, 2); // первый
    expect(payouts.buyers['buyer9']).toBeCloseTo(233.33 + 8, 2); // последний
    expect(payouts.buyers['buyer4']).toBe(8); // средний
  });

  // Тест 5: Нулевые продажи
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

  // Тест 6: Валидация схемы
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
    })).toThrow();
  });

  // Дополнительные тесты для покрытия всех методов API

  // Тест 7: Массовое добавление продаж
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

  // Тест 8: Метод getSalesStats
  test('Getting sales statistics', () => {
    const scheme = { author: { percentage: 100 } };
    const lib = new RevenueSharing({
      productName: 'BestProduct', 
      unitPrice: 50, 
      scheme: scheme
    });
    
    lib.addSale({ buyer: 'buyer1' });
    lib.addSale({ buyer: 'buyer2' });
    lib.addSale({ buyer: 'buyer1' }); // Повторная покупка
    
    const stats = lib.getSalesStats();
    
    expect(stats.productName).toBe('BestProduct');
    expect(stats.unitPrice).toBe(50);
    expect(stats.totalSales).toBe(3);
    expect(stats.totalRevenue).toBe(150);
    expect(stats.uniqueBuyers).toBe(2);
  });

  // Тест 9: Экспорт и импорт данных
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

  // Тест 10: Опции округления
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
    
    // С округлением (по умолчанию)
    const roundedPayouts = lib.calculatePayouts();
    expect(roundedPayouts.author).toBe(33.33);
    
    // Без округления
    const exactPayouts = lib.calculatePayouts({ roundResults: false });
    expect(exactPayouts.author).toBe(33.333);
  });
});
