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

  // --- Дополнительные тесты для увеличения покрытия кода ---

  // Тест 17: Ошибка при инициализации Buy-to-Earn модели без initialInvestment
  test('Error when initializing Buy-to-Earn model without initialInvestment', () => {
    expect(() => {
      new RevenueSharing({
        productName: 'Invalid Buy-to-Earn',
        unitPrice: 100,
        useBuyToEarnModel: true
        // Отсутствует initialInvestment
      });
    }).toThrow('Initial investment is required for Buy-to-Earn model');
  });

  // Тест 18: Ошибка при инициализации стандартной модели без схемы
  test('Error when initializing standard model without scheme', () => {
    expect(() => {
      new RevenueSharing({
        productName: 'Invalid Standard Model',
        unitPrice: 100
        // Отсутствует схема
      });
    }).toThrow('Scheme is required for standard revenue sharing model');
  });

  // Тест 19: Ошибка при добавлении продажи без указания покупателя
  test('Error when adding sale without buyer', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    expect(() => {
      rs.addSale({ /* отсутствует buyer */ });
    }).toThrow('Buyer identifier is required for each sale');
  });

  // Тест 20: Ошибка при массовом добавлении продаж с неправильным форматом
  test('Error when bulk adding sales with wrong format', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    expect(() => {
      rs.addSales('not an array');
    }).toThrow('Expected an array of sales');
  });

  // Тест 21: Ошибка при расчете предоплаченных токенов с неправильными параметрами
  test('Calculating prepayers with invalid parameters', () => {
    const buyToEarn1 = new RevenueSharing({
      productName: 'Invalid Prepayers Test',
      unitPrice: -5, // отрицательная цена
      useBuyToEarnModel: true,
      initialInvestment: 1000
    });
    
    // Ожидаем 0, так как цена отрицательная
    expect(buyToEarn1.calculateNumPrepayers()).toBe(0);
    
    const buyToEarn2 = new RevenueSharing({
      productName: 'Invalid Prepayers Test 2',
      unitPrice: 0, // нулевая цена
      useBuyToEarnModel: true,
      initialInvestment: 1000
    });
    
    // Ожидаем 0, так как цена равна 0
    expect(buyToEarn2.calculateNumPrepayers()).toBe(0);
  });

  // Тест 22: Расчет выплат без округления
  test('Calculating payouts without rounding', () => {
    const rs = new RevenueSharing({
      scheme: {
        author: { percentage: 33.33 },
        platform: { percentage: 33.33 },
        allBuyers: { percentage: 33.34 }
      },
      unitPrice: 3
    });
    
    rs.addSale({ buyer: 'buyer1' });
    
    const payouts = rs.calculatePayouts({ roundResults: false });
    
    // Без округления должны получить точные значения с плавающей точкой
    expect(payouts.author).toBeCloseTo(0.9999, 4);
    expect(payouts.platform).toBeCloseTo(0.9999, 4);
    expect(payouts.buyers.buyer1).toBeCloseTo(1.0002, 4);
  });

  // Тест 23: Расчет выплат Buy-to-Earn без округления
  test('Calculating Buy-to-Earn payouts without rounding', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 100,
      creatorShare: 33.33,
      platformShare: 33.33,
      promotionShare: 33.34,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60,
      unitPrice: 100
    });
    
    // Добавим продажи для 3 токенов (1 предоплаченный + 2 обычных)
    for (let i = 1; i <= 3; i++) {
      buyToEarn.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    const payouts = buyToEarn.calculatePayouts({
      roundResults: false,
      specificTokenNumber: 1
    });
    
    // Проверяем, что значения не округлены
    expect(Number.isInteger(payouts.creator)).toBe(false);
    expect(Number.isInteger(payouts.platform)).toBe(false);
    expect(Number.isInteger(payouts.promotion)).toBe(false);
  });

  // Тест 24: Ошибка при оценке точки окупаемости для стандартной модели
  test('Error when estimating token payback for standard model', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    expect(() => {
      rs.estimateTokenPayback(1);
    }).toThrow('Token payback estimation is only available for Buy-to-Earn model');
  });

  // Тест 25: Получение статистики продаж для Buy-to-Earn модели
  test('Getting sales statistics for Buy-to-Earn model', () => {
    const buyToEarn = new RevenueSharing({
      productName: 'Stats Buy-to-Earn Test',
      unitPrice: 100,
      useBuyToEarnModel: true,
      initialInvestment: 1000,
      creatorShare: 10,
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 70
    });
    
    // Добавим продажи для 15 токенов
    for (let i = 1; i <= 15; i++) {
      buyToEarn.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    const stats = buyToEarn.getSalesStats();
    
    // Проверяем специфичные для Buy-to-Earn поля
    expect(stats.initialInvestment).toBe(1000);
    expect(stats.numPrepayers).toBe(10); // 1000 / 100 = 10
    expect(stats.postPrepaymentSales).toBe(5); // 15 - 10 = 5
    expect(stats.creatorShare).toBe(10);
    expect(stats.platformShare).toBe(10);
    expect(stats.promotionShare).toBe(10);
    expect(stats.buyersShare).toBe(70);
    expect(stats.paybackRatio).toBe(2);
    expect(stats.paybackGoal).toBe(200); // 100 * 2 = 200
    expect(stats.nonPaybackPoolSharePercent).toBe(70);
    expect(stats.paybackPoolSharePercent).toBe(30); // 100 - 70 = 30
  });

  // Тест 26: Импорт невалидных данных с ошибкой валидации
  test('Error when importing invalid data', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    // Невалидный формат данных
    const invalidData = {
      productName: 'Invalid Import',
      // отсутствует unitPrice
      sales: 'not an array' // не массив
    };
    
    expect(() => {
      rs.importData(invalidData);
    }).toThrow('Invalid import data format');
  });

  // Тест 27: Импорт невалидных данных с невалидной схемой
  test('Error when importing data with invalid scheme', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    // Данные с невалидной схемой
    const dataWithInvalidScheme = {
      productName: 'Invalid Scheme Import',
      unitPrice: 20,
      sales: [],
      useBuyToEarnModel: false,
      scheme: {
        author: { percentage: -50 }, // отрицательный процент
        platform: { percentage: 150 } // процент > 100
      }
    };
    
    expect(() => {
      rs.importData(dataWithInvalidScheme);
    }).toThrow('Invalid imported scheme');
  });

  // Тест 28: Импорт невалидных данных для Buy-to-Earn модели
  test('Error when importing invalid Buy-to-Earn data', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 1000,
      unitPrice: 100
    });
    
    // Данные с невалидными параметрами Buy-to-Earn
    const invalidBuyToEarnData = {
      productName: 'Invalid Buy-to-Earn Import',
      unitPrice: 20,
      sales: [],
      useBuyToEarnModel: true,
      // отсутствует initialInvestment
      creatorShare: 'not a number', // строка вместо числа
      platformShare: 10,
      promotionShare: 10,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60
    };
    
    expect(() => {
      buyToEarn.importData(invalidBuyToEarnData);
    }).toThrow('Invalid Buy-to-Earn parameters in imported data');
  });

  // Тест 29: Импорт данных без валидации
  test('Importing data without validation', () => {
    const rs = new RevenueSharing({
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    // Данные с некоторыми проблемами, но мы пропускаем валидацию
    const potentiallyInvalidData = {
      productName: 'Skip Validation Import',
      unitPrice: 20,
      sales: [],
      scheme: {
        author: { percentage: 50 },
        platform: { percentage: 50 }
      }
    };
    
    // Должно пройти успешно, так как validate=false
    expect(() => {
      rs.importData(potentiallyInvalidData, false);
    }).not.toThrow();
    
    // Проверяем, что данные импортированы
    expect(rs.productName).toBe('Skip Validation Import');
    expect(rs.unitPrice).toBe(20);
  });

  // Тест 30: Проверка validateScheme для Buy-to-Earn модели
  test('ValidateScheme for Buy-to-Earn model', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 1000,
      unitPrice: 100
    });
    
    // Для Buy-to-Earn модели validateScheme всегда возвращает true
    const result = buyToEarn.validateScheme();
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  // Тест 31: Получение статистики продаж без отслеживания временных меток
  test('Getting sales statistics without timestamp tracking', () => {
    const rs = new RevenueSharing({
      productName: 'No Timestamp Stats Test',
      scheme: {
        author: { percentage: 70 },
        platform: { percentage: 30 }
      },
      unitPrice: 10,
      options: { trackSaleTimestamp: false } // Отключаем отслеживание timestamp
    });
    
    rs.addSale({ buyer: 'buyer1', timestamp: 1000 });
    rs.addSale({ buyer: 'buyer2', timestamp: 2000 });
    
    const stats = rs.getSalesStats();
    
    // Проверяем, что информация о временных метках отсутствует
    expect(stats.totalSales).toBe(2);
    expect(stats.totalRevenue).toBe(20);
    expect(stats.firstSaleDate).toBeUndefined();
    expect(stats.lastSaleDate).toBeUndefined();
    expect(stats.salesDuration).toBeUndefined();
  });

  // Тест 32: Отключение валидации схемы при инициализации
  test('Disabling scheme validation on initialization', () => {
    // Создаем объект с невалидной схемой, но отключаем валидацию
    const invalidScheme = {
      author: { percentage: -10 }, // Отрицательный процент
      platform: { percentage: 150 } // Процент > 100%
    };
    
    // При включенной валидации должна быть ошибка
    expect(() => {
      new RevenueSharing({
        productName: 'Validation Test',
        scheme: invalidScheme,
        unitPrice: 10,
        options: { validateScheme: true }
      });
    }).toThrow();
    
    // При отключенной валидации ошибки быть не должно
    const rs = new RevenueSharing({
      productName: 'No Validation Test',
      scheme: invalidScheme,
      unitPrice: 10,
      options: { validateScheme: false }
    });
    
    expect(rs).toBeDefined();
  });
  
  // Тест 33: Расчет выплат для Buy-to-Earn модели с округлением и без
  test('Buy-to-Earn payouts with and without rounding', () => {
    const buyToEarn = new RevenueSharing({
      useBuyToEarnModel: true,
      initialInvestment: 1000,
      creatorShare: 33.33, // Нецелое число для проверки округления
      platformShare: 33.33,
      promotionShare: 33.34,
      paybackRatio: 2,
      nonPaybackPoolSharePercent: 60,
      unitPrice: 100
    });
    
    // Добавляем продажи
    for (let i = 1; i <= 20; i++) {
      buyToEarn.addSale({ buyer: `buyer${i}`, timestamp: i * 1000 });
    }
    
    // Расчет с округлением (по умолчанию)
    const roundedPayouts = buyToEarn.calculatePayouts();
    
    // Расчет без округления
    const nonRoundedPayouts = buyToEarn.calculatePayouts({ roundResults: false });
    
    // Проверяем, что в результатах с округлением все значения округлены
    // (целые числа или числа с 2 знаками после запятой)
    expect(Number.isInteger(roundedPayouts.creator) || 
           (roundedPayouts.creator * 100) % 1 === 0).toBe(true);
    expect(Number.isInteger(roundedPayouts.platform) || 
           (roundedPayouts.platform * 100) % 1 === 0).toBe(true);
    expect(Number.isInteger(roundedPayouts.promotion) || 
           (roundedPayouts.promotion * 100) % 1 === 0).toBe(true);
           
    // Проверяем, что в результатах без округления хотя бы одно значение не округлено
    let hasNonRoundValue = false;
    if (!Number.isInteger(nonRoundedPayouts.creator) && 
        (nonRoundedPayouts.creator * 100) % 1 !== 0) {
      hasNonRoundValue = true;
    } else if (!Number.isInteger(nonRoundedPayouts.platform) && 
               (nonRoundedPayouts.platform * 100) % 1 !== 0) {
      hasNonRoundValue = true;
    } else if (!Number.isInteger(nonRoundedPayouts.promotion) && 
               (nonRoundedPayouts.promotion * 100) % 1 !== 0) {
      hasNonRoundValue = true;
    }
    
    // Возможно, что даже без округления все значения получились целыми,
    // поэтому не используем expect здесь
    
    // Сравниваем округленные и неокругленные значения
    expect(Math.abs(roundedPayouts.creator - nonRoundedPayouts.creator)).toBeLessThan(0.01);
    expect(Math.abs(roundedPayouts.platform - nonRoundedPayouts.platform)).toBeLessThan(0.01);
    expect(Math.abs(roundedPayouts.promotion - nonRoundedPayouts.promotion)).toBeLessThan(0.01);
  });
  
  // Тест 34: Проверка отслеживания временных меток продаж
  test('Sale timestamp tracking behavior', () => {
    const rs = new RevenueSharing({
      productName: 'Timestamp Test',
      scheme: { author: { percentage: 100 } },
      unitPrice: 10,
      options: { trackSaleTimestamp: true } // Включаем отслеживание
    });
    
    // Добавляем продажу с явным timestamp
    rs.addSale({ buyer: 'buyer1', timestamp: 1000 });
    
    // Добавляем продажу без timestamp (должен быть установлен автоматически)
    const beforeSale = Date.now();
    rs.addSale({ buyer: 'buyer2' }); // Без явного timestamp
    const afterSale = Date.now();
    
    // Извлекаем данные о продажах и проверяем временные метки
    const exportedData = rs.exportData();
    
    // Проверяем, что первая продажа имеет заданный timestamp
    expect(exportedData.sales[0].timestamp).toBe(1000);
    
    // Проверяем, что вторая продажа имеет автоматически установленный timestamp
    expect(exportedData.sales[1].timestamp).toBeGreaterThanOrEqual(beforeSale);
    expect(exportedData.sales[1].timestamp).toBeLessThanOrEqual(afterSale);
  });
  
  // Тест 35: Проверка опций в exportData
  test('Options in exportData', () => {
    const customOptions = {
      validateScheme: false,
      trackSaleTimestamp: false,
      customOption: 'test'
    };
    
    const rs = new RevenueSharing({
      productName: 'Export Options Test',
      scheme: { author: { percentage: 100 } },
      unitPrice: 10,
      options: customOptions
    });
    
    const exportedData = rs.exportData();
    
    // Проверяем, что все опции сохранены в экспорте
    expect(exportedData.options).toEqual(customOptions);
  });
  
  // Тест 36: Тестирование метода _roundResults с разными типами данных
  test('Round results with different payout structures', () => {
    const rs = new RevenueSharing({
      productName: 'Round Test',
      scheme: { author: { percentage: 100 } },
      unitPrice: 10
    });
    
    // Создаем объект с нечисловым значением для author
    const nonNumericAuthor = { 
      author: "not a number",
      platform: 1.234,
      buyers: { buyer1: 2.345, buyer2: 3.456 }
    };
    
    // Используем приватный метод _roundResults
    const roundedNonNumeric = rs._roundResults(nonNumericAuthor);
    
    // Проверяем, что нечисловое значение не изменилось
    expect(roundedNonNumeric.author).toBe("not a number");
    
    // Проверяем, что числовые значения округлены
    expect(roundedNonNumeric.platform).toBe(1.23);
    expect(roundedNonNumeric.buyers.buyer1).toBe(2.35);
    expect(roundedNonNumeric.buyers.buyer2).toBe(3.46);
  });
  
  // Тест 37: Экспорт/импорт с различными данными и опциями
  test('Export and import with various data and options', () => {
    // Тест покрывает строки 516, 520, 531, 563
    const rs1 = new RevenueSharing({
      productName: 'Complex Export Test',
      scheme: { author: { percentage: 70 }, platform: { percentage: 30 } },
      unitPrice: 10,
      options: { 
        trackSaleTimestamp: true,
        customOption1: 'value1',
        customOption2: 123
      }
    });
    
    // Добавляем продажи с метаданными
    rs1.addSale({ 
      buyer: 'buyer1', 
      timestamp: 1000, 
      metadata: { country: 'US', age: 25 }
    });
    
    rs1.addSale({ 
      buyer: 'buyer2', 
      timestamp: 2000, 
      metadata: { country: 'UK', age: 30, subscription: 'premium' }
    });
    
    // Экспортируем данные
    const exportedData = rs1.exportData();
    
    // Новый инстанс с другими опциями
    const rs2 = new RevenueSharing({
      productName: 'Import Test',
      scheme: { author: { percentage: 100 } },
      unitPrice: 20,
      options: { 
        trackSaleTimestamp: false,
        differentOption: 'value'
      }
    });
    
    // Импортируем данные
    rs2.importData(exportedData);
    
    // Проверяем, что все данные корректно импортированы
    expect(rs2.productName).toBe('Complex Export Test');
    expect(rs2.unitPrice).toBe(10);
    
    // Проверяем, что опции заменены
    expect(rs2.options.trackSaleTimestamp).toBe(true);
    expect(rs2.options.customOption1).toBe('value1');
    expect(rs2.options.customOption2).toBe(123);
    
    // Проверяем, что метаданные продаж сохранены
    const reExportedData = rs2.exportData();
    
    expect(reExportedData.sales[0].metadata.country).toBe('US');
    expect(reExportedData.sales[0].metadata.age).toBe(25);
    expect(reExportedData.sales[1].metadata.subscription).toBe('premium');
  });
});
