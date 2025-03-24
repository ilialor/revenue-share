/**
 * @fileoverview Calculator for revenue sharing payouts
 * @author RevShare Library
 * @version 1.0.0
 */

import { deepClone } from '../utils/MathUtils';

/**
 * Class responsible for calculating payouts based on revenue sharing schemes
 */
class PayoutCalculator {
  /**
   * Calculate payouts based on the provided scheme and sales data
   * @param {Object} data - Calculation data
   * @param {Array} data.sales - Array of sales data
   * @param {Object} data.scheme - Revenue sharing scheme
   * @param {number} data.unitPrice - Price per unit
   * @param {number} data.totalRevenue - Total revenue (typically sales.length * unitPrice)
   * @return {Object} - Calculated payouts
   */
  calculate(data) {
    const { sales, scheme, unitPrice, totalRevenue } = data;
    
    // Create a copy of data to avoid side effects
    const sortedSales = [...sales].sort((a, b) => 
      (a.timestamp && b.timestamp) ? a.timestamp - b.timestamp : 0);
    
    // Initialize payouts object
    const payouts = {
      author: 0,
      platform: 0,
      buyers: {}
    };
    
    // Initialize payouts for all buyers
    sortedSales.forEach(sale => {
      payouts.buyers[sale.buyer] = 0;
    });
    
    // Track allocated percentage
    let totalAllocatedPercentage = 0;
    
    // Process fixed percentage allocations first
    this._processFixedPercentages(scheme, sortedSales, payouts, totalRevenue);
    
    // Calculate the total allocated percentage
    totalAllocatedPercentage = this._calculateAllocatedPercentage(scheme);
    
    // Process remainder allocation
    this._processRemainder(scheme, sortedSales, payouts, totalRevenue, totalAllocatedPercentage);
    
    return payouts;
  }
  
  /**
   * Process fixed percentage allocations
   * @param {Object} scheme - Revenue sharing scheme
   * @param {Array} sortedSales - Sorted sales data
   * @param {Object} payouts - Payouts object to populate
   * @param {number} totalRevenue - Total revenue
   * @private
   */
  _processFixedPercentages(scheme, sortedSales, payouts, totalRevenue) {
    for (const [key, rule] of Object.entries(scheme)) {
      // Skip rules without percentage
      if (!('percentage' in rule)) continue;
      
      const share = (totalRevenue * rule.percentage) / 100;
      
      if (key === 'author') {
        payouts.author += share;
      } else if (key === 'platform') {
        payouts.platform += share;
      } else if (rule.count) {
        // Handle buyer group rules
        this._processGroupAllocation(rule, sortedSales, payouts, share);
      } else if (key === 'allBuyers' || key.startsWith('buyers')) {
        // Handle allocation to all buyers
        this._processAllBuyersAllocation(sortedSales, payouts, share);
      }
    }
  }
  
  /**
   * Calculate total allocated percentage
   * @param {Object} scheme - Revenue sharing scheme
   * @return {number} - Sum of all percentage allocations
   * @private
   */
  _calculateAllocatedPercentage(scheme) {
    return Object.values(scheme)
      .filter(rule => 'percentage' in rule)
      .reduce((total, rule) => total + rule.percentage, 0);
  }
  
  /**
   * Process remainder allocation
   * @param {Object} scheme - Revenue sharing scheme
   * @param {Array} sortedSales - Sorted sales data
   * @param {Object} payouts - Payouts object to populate
   * @param {number} totalRevenue - Total revenue
   * @param {number} totalAllocatedPercentage - Sum of all percentage allocations
   * @private
   */
  _processRemainder(scheme, sortedSales, payouts, totalRevenue, totalAllocatedPercentage) {
    // Calculate remainder
    const remainder = totalRevenue * (1 - totalAllocatedPercentage / 100);
    
    // Skip if no remainder
    if (remainder <= 0) return;
    
    for (const [key, rule] of Object.entries(scheme)) {
      // Skip rules without remainder flag
      if (!rule.remainder) continue;
      
      if (key === 'author') {
        payouts.author += remainder;
      } else if (key === 'platform') {
        payouts.platform += remainder;
      } else if (key === 'allBuyers' || key.startsWith('buyers')) {
        this._processAllBuyersAllocation(sortedSales, payouts, remainder);
      } else if (rule.count) {
        // Handle buyer group rules
        this._processGroupAllocation(rule, sortedSales, payouts, remainder);
      }
    }
  }
  
  /**
   * Process allocation to a group of buyers
   * @param {Object} rule - Group rule
   * @param {Array} sortedSales - Sorted sales data
   * @param {Object} payouts - Payouts object to populate
   * @param {number} share - Total share to allocate
   * @private
   */
  _processGroupAllocation(rule, sortedSales, payouts, share) {
    let group;
    
    // Extract the relevant group based on rule
    if (rule.fromEnd) {
      // Get last N buyers
      group = sortedSales.slice(-rule.count);
    } else {
      // Get first N buyers
      group = sortedSales.slice(0, rule.count);
    }
    
    const groupSize = Math.min(group.length, rule.count);
    
    // Skip if group is empty
    if (groupSize <= 0) return;
    
    // Calculate individual share
    const individualShare = share / groupSize;
    
    // Distribute share to each buyer in the group
    group.forEach(sale => {
      payouts.buyers[sale.buyer] += individualShare;
    });
  }
  
  /**
   * Process allocation to all buyers
   * @param {Array} sortedSales - Sorted sales data
   * @param {Object} payouts - Payouts object to populate
   * @param {number} share - Total share to allocate
   * @private
   */
  _processAllBuyersAllocation(sortedSales, payouts, share) {
    // Skip if no sales
    if (sortedSales.length <= 0) return;
    
    // Calculate individual share
    const individualShare = share / sortedSales.length;
    
    // Distribute share to each buyer
    sortedSales.forEach(sale => {
      payouts.buyers[sale.buyer] += individualShare;
    });
  }
  
  /**
   * Generate a custom calculation function for complex scenarios
   * @param {Function} calculationFn - Custom calculation function
   * @return {Function} - Calculator function
   */
  createCustomCalculator(calculationFn) {
    if (typeof calculationFn !== 'function') {
      throw new Error('Custom calculator must be a function');
    }
    
    return (data) => {
      const basePayouts = this.calculate(data);
      return calculationFn(data, basePayouts);
    };
  }
}

export default PayoutCalculator;
