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
      scheme: BasicSchemes.AuthorPlatformBuyers
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
    // AuthorPlatformBuyers: Author 40%, Platform 30%, All Buyers 30%
    expect(payouts.author).toBe(120); // 40% of 300
    expect(payouts.platform).toBe(90); // 30% of 300
    expect(payouts.buyers.buyer1).toBe(30); // 10% of 300 per buyer
    expect(payouts.buyers.buyer2).toBe(30);
    expect(payouts.buyers.buyer3).toBe(30);
  });
  
  test('Complete workflow with advanced scheme', () => {
    // Create instance with an advanced scheme
    const lib = new RevenueSharing({
      productName: 'Advanced Integration Test',
      unitPrice: 50,
      scheme: AdvancedSchemes.EarlyBuyersBonus
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
    
    // EarlyBuyersBonus typically has:
    // Author 40%, Platform 30%, Early Buyers (first 3) 20%, All Buyers 10%
    expect(payouts.author).toBe(100); // 40% of 250
    expect(payouts.platform).toBe(75); // 30% of 250
    
    // First 3 buyers get extra bonus
    expect(payouts.buyers.buyer0).toBeGreaterThan(payouts.buyers.buyer3);
    expect(payouts.buyers.buyer1).toBeGreaterThan(payouts.buyers.buyer3);
    expect(payouts.buyers.buyer2).toBeGreaterThan(payouts.buyers.buyer3);
    
    // Last 2 buyers get same amount
    expect(payouts.buyers.buyer3).toBe(payouts.buyers.buyer4);
  });
  
  test('Data import/export workflow', () => {
    // Create first instance
    const lib1 = new RevenueSharing({
      productName: 'Export Test Product',
      unitPrice: 75,
      scheme: BasicSchemes.AuthorPlatformEqual
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
      scheme: BasicSchemes.AuthorAll
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
      marketingPartner: { percentage: 15 },
      allBuyers: { percentage: 25 }
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
    expect(payouts.marketingPartner).toBe(120); // 15% of 800
    
    // Each buyer should get equal share of buyer allocation
    const buyerTotal = Object.values(payouts.buyers).reduce((sum, value) => sum + value, 0);
    expect(buyerTotal).toBe(200); // 25% of 800
    expect(payouts.buyers.buyer0).toBe(50); // Equal distribution among 4 buyers
  });
  
  test('Error handling during payout calculation', () => {
    // Create instance with invalid scheme
    const lib = new RevenueSharing({
      productName: 'Error Test Product',
      unitPrice: 100,
      scheme: {},
      options: { validateScheme: false } // Disable validation to allow invalid scheme
    });
    
    // Add sales
    lib.addSale({ buyer: 'buyer1' });
    
    // Attempting to calculate payouts should throw an error or return error object
    expect(() => lib.calculatePayouts()).toThrow();
  });

  test('Real-world scenario: course platform revenue sharing', () => {
    // Scenario: Online course platform with instructor, platform fee, affiliates, and students
    const courseScheme = {
      instructor: { percentage: 50 }, // Instructor gets 50%
      platform: { percentage: 20 },   // Platform gets 20%
      affiliates: { percentage: 10 }, // Affiliates get 10%
      earlyBuyers: { count: 5, percentage: 15 }, // First 5 students get 15% (3% each)
      allBuyers: { percentage: 5 }    // All students share 5%
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
    expect(payouts.instructor).toBe(totalRevenue * 0.5); // 50%
    expect(payouts.platform).toBe(totalRevenue * 0.2);   // 20%
    expect(payouts.affiliates).toBe(totalRevenue * 0.1); // 10%
    
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
