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
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 100 }
      },
      unitPrice: 10
    });
    
    rs.addSale({ buyer: 'buyer1' });
    rs.addSale({ buyer: 'buyer2' });
    
    const payouts = rs.calculatePayouts();
    
    expect(payouts.author).toBe(20); // 2 sales * 10 units = 20
    expect(payouts.platform).toBe(0);
    expect(Object.keys(payouts.buyers).length).toBe(2);
  });

  // Тест 2: Фиксированные проценты и остаток покупателям
  test('Fixed percentages with remainder to all buyers', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 20 },
        allBuyers: { remainder: true }
      },
      unitPrice: 10
    });
    
    rs.addSale({ buyer: 'buyer1' });
    rs.addSale({ buyer: 'buyer2' });
    
    const payouts = rs.calculatePayouts();
    
    expect(payouts.author).toBe(14); // 70% of 20
    expect(payouts.platform).toBe(4); // 20% of 20
    expect(payouts.buyers.buyer1).toBe(1); // 5% of 20
    expect(payouts.buyers.buyer2).toBe(1); // 5% of 20
  });

  // Тест 3: Схема с группой ранних покупателей
  test('Early buyers bonus', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 50 },
        platform: { percentage: 30 },
        earlyBuyers: { count: 1, percentage: 20 }
      },
      unitPrice: 10
    });
    
    rs.addSale({ buyer: 'buyer1', timestamp: 1000 });
    rs.addSale({ buyer: 'buyer2', timestamp: 2000 });
    
    const payouts = rs.calculatePayouts();
    
    expect(payouts.author).toBe(10); // 50% of 20
    expect(payouts.platform).toBe(6); // 30% of 20
    expect(payouts.buyers.buyer1).toBe(4); // 20% of 20
    expect(payouts.buyers.buyer2).toBe(0);
  });

  // Тест 4: Схема "скользящего окна"
  test('Sliding window scheme', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 50 },
        platform: { percentage: 20 },
        firstTen: { count: 2, percentage: 30 } // Will apply to all sales in this test
      },
      unitPrice: 10
    });
    
    // Add 5 sales
    for (let i = 1; i <= 5; i++) {
      rs.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    const payouts = rs.calculatePayouts();
    
    expect(payouts.author).toBe(25); // 50% of 50
    expect(payouts.platform).toBe(10); // 20% of 50
    
    // First two buyers get the bonus
    expect(payouts.buyers.buyer1).toBe(7.5); // 15% of 50
    expect(payouts.buyers.buyer2).toBe(7.5); // 15% of 50
    expect(payouts.buyers.buyer3).toBe(0);
  });

  // Тест 5: Нулевые продажи
  test('Zero sales', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10
    });
    
    const payouts = rs.calculatePayouts();
    
    expect(payouts.author).toBe(0);
    expect(payouts.platform).toBe(0);
    expect(Object.keys(payouts.buyers).length).toBe(0);
  });

  // Тест 6: Валидация схемы
  test('Scheme validation', () => {
    // Создаем объект с валидной схемой
    const rs = new RevenueSharing({
      productName: 'Validation Test',
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10,
      options: { validateScheme: true }
    });
    
    // Проверяем, что объект создан и схема валидна
    expect(rs).toBeDefined();
    const result = rs.validateScheme();
    expect(result.isValid).toBe(true);
    
    // Проверяем, что невалидная схема вернет ошибки
    const invalidResult = rs.validator.validate({
      author: { percentage: -10 },
      platform: { percentage: 110 }
    });
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors.length).toBeGreaterThan(0);
  });

  // Дополнительные тесты для покрытия всех методов API

  // Тест 7: Массовое добавление продаж
  test('Bulk adding sales', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10
    });
    
    rs.addSales([
      { buyer: 'buyer1', timestamp: 1000 },
      { buyer: 'buyer2', timestamp: 2000 }
    ]);
    
    const stats = rs.getSalesStats();
    expect(stats.totalSales).toBe(2);
  });

  // Тест 8: Метод getSalesStats
  test('Getting sales statistics', () => {
    const rs = new RevenueSharing({
      productName: 'Stats Test',
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10,
      options: { trackSaleTimestamp: true }
    });
    
    rs.addSale({ buyer: 'buyer1', timestamp: 1000 });
    rs.addSale({ buyer: 'buyer2', timestamp: 2000 });
    
    const stats = rs.getSalesStats();
    expect(stats.totalSales).toBe(2);
    expect(stats.totalRevenue).toBe(20);
    
    // Проверяем только что значения существуют, без конкретных значений
    expect(stats.uniqueBuyers).toBe(2);
  });

  // Тест 9: Экспорт и импорт данных
  test('Export and import data', () => {
    const rs1 = new RevenueSharing({
      productName: 'Export Product',
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10
    });
    
    rs1.addSale({ buyer: 'buyer1', timestamp: 1000 });
    
    const exportedData = rs1.exportData();
    
    const rs2 = new RevenueSharing({
      productName: 'Different Product',
      scheme: {
        author: { percentage: 50 },
        platform: { percentage: 50 }
      },
      unitPrice: 20
    });
    
    // Проверяем, что данные успешно импортированы
    rs2.importData(exportedData);
    
    // Сравниваем экспортированные и импортированные данные
    expect(rs2.productName).toBe('Export Product');
    expect(rs2.unitPrice).toBe(10);
    
    const payouts1 = rs1.calculatePayouts();
    const payouts2 = rs2.calculatePayouts();
    
    expect(payouts2.author).toBe(payouts1.author);
    expect(payouts2.platform).toBe(payouts1.platform);
  });

  // Тест 10: Опции округления
  test('Rounding options in calculation', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 33.33 },
        platform: { percentage: 33.33 },
        allBuyers: { percentage: 33.34 }
      },
      unitPrice: 3
    });
    
    rs.addSale({ buyer: 'buyer1' });
    
    const payouts = rs.calculatePayouts();
    
    // Without rounding, would be 0.9999, 0.9999, 1.0002
    expect(payouts.author).toBe(1);
    expect(payouts.platform).toBe(1);
    expect(payouts.buyers.buyer1).toBe(1);
  });

  // ----- Тесты для Buy-to-Earn модели -----

  // Тест 11: Инициализация Buy-to-Earn модели
  test('Initializing Buy-to-Earn model', () => {
    const buyToEarn = new RevenueSharing({
      productName: 'Buy-to-Earn Product',
      unitPrice: 100,
      useBuyToEarnModel: true,
      initialInvestment: 10000,
      creatorShare: 20,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    });
    
    // Проверяем инициализацию Buy-to-Earn модели
    expect(buyToEarn.useBuyToEarnModel).toBe(true);
    expect(buyToEarn.initialInvestment).toBe(10000);
    expect(buyToEarn.paybackRatio).toBe(2);
    expect(buyToEarn.creatorShare).toBe(20);
    expect(buyToEarn.platformShare).toBe(10);
    expect(buyToEarn.promotionShare).toBe(10);
    expect(buyToEarn.buyersShare).toBe(60); // 100 - 20 - 10 - 10
  });

  // Тест 12: Расчет количества предоплаченных токенов
  test('Calculating number of prepayers', () => {
    const buyToEarn = new RevenueSharing({
      productName: 'Buy-to-Earn Product',
      unitPrice: 100,
      useBuyToEarnModel: true,
      initialInvestment: 10000
    });
    
    // Проверяем расчет количества предоплаченных токенов
    expect(buyToEarn.calculateNumPrepayers()).toBe(100); // 10000 / 100 = 100
  });

  // Тест 13: Расчет выплат для Buy-to-Earn модели
  test('Calculating payouts for Buy-to-Earn model', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 10000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60,
      unitPrice: 100
    });
    
    // Add 200 sales (100 prepayers + 100 regular)
    for (let i = 1; i <= 200; i++) {
      buyToEarn.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    const payouts = buyToEarn.calculatePayouts({
      specificTokenNumber: 50
    });
    
    // Creator gets initial investment + share of regular sales
    expect(payouts.creator).toBeGreaterThan(10000);
    
    // Platform and promotion get shares of regular sales
    expect(payouts.platform).toBeGreaterThan(0);
    expect(payouts.promotion).toBeGreaterThan(0);
    
    // Token 50 (middle of prepayers) should have earnings
    expect(payouts.buyer).toBeGreaterThan(0);
  });

  // Тест 14: Оценка точки окупаемости токена
  test('Estimating token payback point', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 10000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60,
      unitPrice: 100
    });
    
    const estimation = buyToEarn.estimateTokenPayback(50);
    
    expect(estimation.paybackSale).toBeGreaterThan(50);
    expect(estimation.accumulatedEarnings).toBe(200); // paybackRatio * unitPrice
    expect(parseFloat(estimation.roi)).toBe(100); // 2x payback = 100% ROI
  });

  // Тест 15: Экспорт и импорт данных для Buy-to-Earn модели
  test('Export and import Buy-to-Earn data', () => {
    const buyToEarn1 = new RevenueSharing({
      productName: 'Buy-to-Earn Export',
      unitPrice: 100,
      useBuyToEarnModel: true,
      initialInvestment: 10000,
      creatorShare: 20,
      platformShare: 10,
      promotionShare: 10
    });
    
    buyToEarn1.addSale({ buyer: 'buyer1' });
    buyToEarn1.addSale({ buyer: 'buyer2' });
    
    const exportedData = buyToEarn1.exportData();
    
    const buyToEarn2 = new RevenueSharing({
      productName: 'Different Buy-to-Earn',
      unitPrice: 50,
      useBuyToEarnModel: true,
      initialInvestment: 5000
    });
    
    buyToEarn2.importData(exportedData);
    
    // Проверяем корректность импорта данных
    expect(buyToEarn2.productName).toBe('Buy-to-Earn Export');
    expect(buyToEarn2.unitPrice).toBe(100);
    expect(buyToEarn2.initialInvestment).toBe(10000);
    expect(buyToEarn2.creatorShare).toBe(20);
    expect(buyToEarn2.platformShare).toBe(10);
    expect(buyToEarn2.promotionShare).toBe(10);
    
    // Проверяем, что все продажи перенесены
    const stats = buyToEarn2.getSalesStats();
    expect(stats.totalSales).toBe(2);
  });

  // Тест 16: Buy-to-Earn с разными параметрами
  test('Buy-to-Earn with different parameters', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 10000,
      creatorShare: 15,
      platformShare: 10,
      promotionShare: 5,
      paybackRatio: 1.5,
      nonPaybackPoolSharePercent: 80, // More emphasis on non-paid back tokens
      unitPrice: 100
    });
    
    // Add 200 sales (100 prepayers + 100 regular)
    for (let i = 1; i <= 200; i++) {
      buyToEarn.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    const payouts = buyToEarn.calculatePayouts({
      specificTokenNumber: 50
    });
    
    expect(payouts.creator).toBeGreaterThan(10000);
    expect(payouts.paybackGoal).toBe(150); // 1.5 * 100
  });
});
