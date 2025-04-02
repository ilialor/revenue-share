/**
 * @fileoverview Tests for the RevenueSharing core class
 * @author RevShare Library
 * @version 2.0.0
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

  // ----- Тесты для Buy-to-Earn модели -----

  // Тест 11: Инициализация Buy-to-Earn модели
  test('Initializing Buy-to-Earn model', () => {
    const lib = new RevenueSharing({
      productName: 'BuyToEarnProduct',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    // Проверка правильной инициализации
    expect(lib.productName).toBe('BuyToEarnProduct');
    expect(lib.unitPrice).toBe(500);
    expect(lib.useBuyToEarnModel).toBe(true);
    expect(lib.initialInvestment).toBe(300000);
    expect(lib.creatorShare).toBe(10);
    expect(lib.platformShare).toBe(10);
    expect(lib.promotionShare).toBe(10);
    expect(lib.paybackRatio).toBe(2);
    expect(lib.nonPaybackPoolSharePercent).toBe(60);
  });

  // Тест 12: Расчет числа предоплатных токенов
  test('Calculating number of prepayers', () => {
    const lib = new RevenueSharing({
      productName: 'BuyToEarnProduct',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10
    });
    
    const numPrepayers = lib.calculateNumPrepayers();
    
    // 300000 / 500 = 600
    expect(numPrepayers).toBe(600);
  });

  // Тест 13: Расчет выплат для Buy-to-Earn модели
  test('Calculating payouts for Buy-to-Earn model', () => {
    const lib = new RevenueSharing({
      productName: 'BuyToEarnProduct',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    // Добавляем продажи (включая предоплатные)
    for (let i = 1; i <= 1000; i++) {
      lib.addSale({ buyer: `buyer${i}`, timestamp: 1000 + i });
    }
    
    // Расчет для конкретного токена
    const payouts = lib.calculatePayouts({
      specificTokenNumber: 100
    });
    
    // Основные проверки
    expect(payouts.creator).toBeGreaterThan(300000); // Создатель должен получить минимум initialInvestment
    expect(payouts.platform).toBeGreaterThan(0);
    expect(payouts.promotion).toBeGreaterThan(0);
    expect(payouts.buyer).toBeGreaterThan(0);
    expect(payouts.prepayersCount).toBe(600);
    expect(payouts.paybackGoal).toBe(1000); // 500 * 2 = 1000
    
    // Расчет общих выплат (без указания токена)
    const generalPayouts = lib.calculatePayouts();
    
    // Те же проверки для общих выплат
    expect(generalPayouts.creator).toBeGreaterThan(300000);
    expect(generalPayouts.platform).toBeGreaterThan(0);
    expect(generalPayouts.promotion).toBeGreaterThan(0);
  });

  // Тест 14: Оценка точки окупаемости токена
  test('Estimating token payback point', () => {
    const lib = new RevenueSharing({
      productName: 'BuyToEarnProduct',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    // Оценка для токена #100
    const estimate = lib.estimateTokenPayback(100);
    
    // Проверки
    expect(estimate.paybackSale).toBeGreaterThan(100);
    expect(estimate.accumulatedEarnings).toBeGreaterThan(0);
    expect(estimate.roi).toBeDefined();
    
    // Оценка должна отличаться для разных токенов
    const estimateEarly = lib.estimateTokenPayback(10);
    const estimateLate = lib.estimateTokenPayback(500);
    
    expect(estimateEarly.paybackSale).toBeLessThan(estimateLate.paybackSale);
  });

  // Тест 15: Экспорт/импорт данных для Buy-to-Earn модели
  test('Export and import Buy-to-Earn data', () => {
    const lib1 = new RevenueSharing({
      productName: 'BuyToEarnProduct',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    // Добавляем продажи
    for (let i = 1; i <= 700; i++) {
      lib1.addSale({ buyer: `buyer${i}`, timestamp: 1000 + i });
    }
    
    const exportedData = lib1.exportData();
    
    // Создаем новый инстанс с другими параметрами
    const lib2 = new RevenueSharing({
      productName: 'DummyProduct',
      unitPrice: 100,
      scheme: { author: { percentage: 100 } }
    });
    
    // Импортируем данные
    lib2.importData(exportedData);
    
    // Проверка правильности импорта
    expect(lib2.productName).toBe('BuyToEarnProduct');
    expect(lib2.unitPrice).toBe(500);
    expect(lib2.useBuyToEarnModel).toBe(true);
    expect(lib2.initialInvestment).toBe(300000);
    expect(lib2.sales.length).toBe(700);
    
    // Расчет должен работать
    const payouts = lib2.calculatePayouts({ specificTokenNumber: 100 });
    expect(payouts.creator).toBeGreaterThan(300000);
  });

  // Тест 16: Buy-to-Earn с разными параметрами
  test('Buy-to-Earn with different parameters', () => {
    // Создаем модели с разными параметрами
    const highCreatorShare = new RevenueSharing({
      productName: 'HighCreatorShare',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 25, // Высокая доля создателя
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    const highPaybackRatio = new RevenueSharing({
      productName: 'HighPaybackRatio',
      unitPrice: 500,
      useBuyToEarnModel: true,
      initialInvestment: 300000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 3, // Высокий множитель окупаемости
      nonPaybackPoolSharePercent: 60
    });
    
    // Добавляем одинаковые продажи
    for (let i = 1; i <= 1000; i++) {
      highCreatorShare.addSale({ buyer: `buyer${i}`, timestamp: 1000 + i });
      highPaybackRatio.addSale({ buyer: `buyer${i}`, timestamp: 1000 + i });
    }
    
    // Расчет для токена #100
    const payoutsCreator = highCreatorShare.calculatePayouts({ specificTokenNumber: 100 });
    const payoutsRatio = highPaybackRatio.calculatePayouts({ specificTokenNumber: 100 });
    
    // С высокой долей создателя токены должны окупаться медленнее
    if (payoutsCreator.paybackPoint && payoutsRatio.paybackPoint) {
      expect(payoutsCreator.paybackPoint).toBeGreaterThan(payoutsRatio.paybackPoint);
    }
    
    // Цель окупаемости должна быть разной
    expect(payoutsRatio.paybackGoal).toBe(1500); // 500 * 3
    expect(payoutsCreator.paybackGoal).toBe(1000); // 500 * 2
    
    // Создатель должен получать больше в модели с высокой долей
    expect(payoutsCreator.creator).toBeGreaterThan(payoutsRatio.creator);
  });
});
