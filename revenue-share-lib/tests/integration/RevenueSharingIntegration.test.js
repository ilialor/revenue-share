/**
 * @fileoverview Integration tests for the Revenue Sharing library
 * @author RevShare Library
 * @version 1.0.0
 */

import RevenueSharing from '../../src/core/RevenueSharing';
import * as BasicSchemes from '../../src/schemes/BasicSchemes';
import * as AdvancedSchemes from '../../src/schemes/AdvancedSchemes';

describe('Revenue Sharing Library Integration', () => {
  test('Complete workflow with basic scheme', () => {
    // Create instance with a basic scheme
    const lib = new RevenueSharing({
      productName: 'Integration Test Product',
      unitPrice: 100,
      scheme: BasicSchemes.COMMUNITY_EQUAL
    });
    
    // Add multiple sales
    lib.addSale({ buyer: 'buyer1' });
    lib.addSale({ buyer: 'buyer2' });
    lib.addSale({ buyer: 'buyer3' });
    
    // Get sales statistics
    const stats = lib.getSalesStats();
    expect(stats.totalSales).toBe(3);
    expect(stats.totalRevenue).toBe(300);
    expect(stats.uniqueBuyers).toBe(3);
    
    // Calculate payouts
    const payouts = lib.calculatePayouts();
    
    // Verify payouts based on the scheme
    // COMMUNITY_EQUAL: Author 30%, Platform 20%, All Buyers 50%
    expect(payouts.author).toBe(90); // 30% of 300
    expect(payouts.platform).toBe(60); // 20% of 300
    // Каждый покупатель получает равную долю из 50% общей суммы
    const perBuyer = 300 * 0.5 / 3; // 50 на каждого покупателя
    expect(payouts.buyers.buyer1).toBe(perBuyer);
    expect(payouts.buyers.buyer2).toBe(perBuyer);
    expect(payouts.buyers.buyer3).toBe(perBuyer);
  });
  
  test('Complete workflow with advanced scheme', () => {
    // Create instance with an advanced scheme
    const lib = new RevenueSharing({
      productName: 'Advanced Integration Test',
      unitPrice: 50,
      scheme: AdvancedSchemes.EARLY_ADOPTER_TIERS // Используем схему, которая точно даст разные выплаты
    });
    
    // Add sales with timestamps to control order
    for (let i = 0; i < 5; i++) {
      lib.addSale({ 
        buyer: `buyer${i}`,
        timestamp: Date.now() + (i * 1000) // Ensure sequential order
      });
    }
    
    // Get sales statistics
    const stats = lib.getSalesStats();
    expect(stats.totalSales).toBe(5);
    expect(stats.totalRevenue).toBe(250);
    
    // Calculate payouts
    const payouts = lib.calculatePayouts();
    
    // Verify author and platform shares
    expect(payouts.author).toBeDefined();
    expect(payouts.platform).toBeDefined();
    
    // Для EARLY_ADOPTER_TIERS ранние покупатели получат больше
    // Проверим, что общие выплаты всем покупателям не равны нулю
    const buyerTotal = Object.values(payouts.buyers).reduce((sum, value) => sum + value, 0);
    expect(buyerTotal).toBeGreaterThan(0);
    
    // Проверим, что хотя бы один из ранних покупателей получил выплаты
    expect(Object.values(payouts.buyers).some(value => value > 0)).toBe(true);
  });
  
  test('Data import/export workflow', () => {
    // Create first instance
    const lib1 = new RevenueSharing({
      productName: 'Export Test Product',
      unitPrice: 75,
      scheme: BasicSchemes.EQUAL_SPLIT
    });
    
    // Add sales
    lib1.addSale({ buyer: 'buyer1' });
    lib1.addSale({ buyer: 'buyer2' });
    
    // Export data
    const exportedData = lib1.exportData();
    
    // Create second instance with different settings
    const lib2 = new RevenueSharing({
      productName: 'Import Test Product',
      unitPrice: 100,
      scheme: BasicSchemes.AUTHOR_CENTRIC
    });
    
    // Import data from first instance
    lib2.importData(exportedData);
    
    // Verify import worked correctly
    expect(lib2.productName).toBe('Export Test Product');
    expect(lib2.unitPrice).toBe(75);
    
    // Calculate payouts and verify they match first instance
    const payouts1 = lib1.calculatePayouts();
    const payouts2 = lib2.calculatePayouts();
    
    expect(payouts2.author).toBe(payouts1.author);
    expect(payouts2.platform).toBe(payouts1.platform);
    expect(Object.keys(payouts2.buyers).length).toBe(Object.keys(payouts1.buyers).length);
  });
  
  test('Custom scheme creation and usage', () => {
    // Create a custom scheme
    const customScheme = {
      author: { percentage: 35 },
      platform: { percentage: 25 },
      allBuyers: { percentage: 40 } // Упрощаем схему
    };
    
    // Create library instance with custom scheme
    const lib = new RevenueSharing({
      productName: 'Custom Scheme Test',
      unitPrice: 200,
      scheme: customScheme
    });
    
    // Add sales
    for (let i = 0; i < 4; i++) {
      lib.addSale({ buyer: `buyer${i}` });
    }
    
    // Calculate payouts
    const payouts = lib.calculatePayouts();
    
    // Verify payouts match the custom scheme
    expect(payouts.author).toBe(280); // 35% of 800
    expect(payouts.platform).toBe(200); // 25% of 800
    
    // Each buyer should get equal share of buyer allocation
    const buyerTotal = Object.values(payouts.buyers).reduce((sum, value) => sum + value, 0);
    expect(buyerTotal).toBe(320); // 40% of 800
    expect(payouts.buyers.buyer0).toBe(80); // Equal distribution among 4 buyers
  });
  
  test('Error handling during payout calculation', () => {
    // Create instance with invalid scheme but disable validation
    const invalidScheme = {
      author: { percentage: -10 },
      platform: { percentage: 110 }
    };
    
    const lib = new RevenueSharing({
      productName: 'Error Test Product',
      unitPrice: 100,
      scheme: invalidScheme,
      options: { validateScheme: false }
    });
    
    // Add sales
    lib.addSale({ buyer: 'buyer1' });
    
    // Validate that scheme is invalid
    const validationResult = lib.validateScheme();
    expect(validationResult.isValid).toBe(false);
  });

  test('Real-world scenario: course platform revenue sharing', () => {
    // Scenario: Online course platform with instructor, platform fee, and students
    const courseScheme = {
      author: { percentage: 50 }, // Автор получает 50%
      platform: { percentage: 30 }, // Platform gets 30%
      earlyBuyers: { count: 5, percentage: 15 }, // First 5 students get 15% (3% each)
      allBuyers: { percentage: 5 } // All students share 5%
    };
    
    const course = new RevenueSharing({
      productName: 'Advanced JavaScript Course',
      unitPrice: 199,
      scheme: courseScheme
    });
    
    // Add 10 sales (first 5 are early buyers)
    for (let i = 0; i < 10; i++) {
      course.addSale({ 
        buyer: `student${i}`,
        timestamp: Date.now() + (i * 1000)
      });
    }
    
    // Calculate payouts
    const payouts = course.calculatePayouts();
    
    // Total revenue: 10 * 199 = 1990
    const totalRevenue = 1990;
    
    // Verify payouts
    expect(payouts.author).toBe(totalRevenue * 0.5); // 50%
    expect(payouts.platform).toBe(totalRevenue * 0.3); // 30%
    
    // Early buyers get extra
    for (let i = 0; i < 5; i++) {
      expect(payouts.buyers[`student${i}`]).toBeGreaterThan(payouts.buyers['student9']);
    }
    
    // Later buyers get less
    for (let i = 5; i < 10; i++) {
      expect(payouts.buyers[`student${i}`]).toBeLessThan(payouts.buyers['student0']);
    }
  });
});
