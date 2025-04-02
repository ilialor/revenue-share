/**
 * @fileoverview Calculator for revenue sharing payouts
 * @author RevShare Library
 * @version 2.0.0
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
   * @param {Object} [data.buyToEarnParams] - Optional Buy-to-Earn specific parameters
   * @return {Object} - Calculated payouts
   */
  calculate(data) {
    // Check if we're using Buy-to-Earn model
    if (data.buyToEarnParams) {
      return this.calculateBuyToEarnPayouts(data);
    }
    
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
   * Calculate payouts using Buy-to-Earn model with dual pool system
   * @param {Object} data - Calculation data including Buy-to-Earn parameters
   * @return {Object} - Calculated payouts with accrued revenue
   */
  calculateBuyToEarnPayouts(data) {
    const { sales, unitPrice, buyToEarnParams } = data;
    const { 
      initialInvestment, 
      creatorShare, 
      platformShare, 
      promotionShare, 
      paybackRatio, 
      nonPaybackPoolSharePercent,
      specificTokenNumber = 1 
    } = buyToEarnParams;
    
    const totalSales = sales.length;
    const numPrepayers = Math.ceil(initialInvestment / unitPrice);
    const paybackGoal = unitPrice * paybackRatio;
    const buyersShare = 100 - creatorShare - platformShare - promotionShare;
    const paybackPoolSharePercent = 100 - nonPaybackPoolSharePercent;

    // If not enough sales to cover prepayers, return simplified results
    if (totalSales < numPrepayers) {
      return {
        creator: initialInvestment,
        platform: 0,
        promotion: 0,
        buyer: 0,
        prepayersCount: numPrepayers,
        paidBackCount: 0,
        paybackPoint: null,
        totalRevenueAtPayback: 0,
        creatorRevenueAtPayback: 0,
        platformRevenueAtPayback: 0,
        paybackGoal: paybackGoal,
        actualInitialInvestment: initialInvestment
      };
    }

    // Sort sales by timestamp
    const sortedSales = [...sales].sort((a, b) => 
      (a.timestamp && b.timestamp) ? a.timestamp - b.timestamp : 0);
    
    // Initialize counters and accumulators
    let creatorRevenue = initialInvestment; // Creator gets full prepayment
    let platformRevenue = 0;
    let promotionRevenue = 0;
    let totalRevenue = initialInvestment; // Start with initial investment
    
    // For tracking token payback status
    let tokenEarnings = new Array(totalSales + 1).fill(0);
    let paidBackCount = 0;
    
    // For tracking payback point of the specific token
    let paybackPoint = null;
    let totalRevenueAtPayback = 0;
    let creatorRevenueAtPayback = 0;
    let platformRevenueAtPayback = 0;
    
    // Simulate post-prepayment phase sale by sale
    for (let currentSale = numPrepayers + 1; currentSale <= totalSales; currentSale++) {
      // Update total revenue
      totalRevenue += unitPrice;
      
      // Calculate shares for this sale
      const creatorAmount = unitPrice * (creatorShare / 100);
      const platformAmount = unitPrice * (platformShare / 100);
      const promotionAmount = unitPrice * (promotionShare / 100);
      const buyersAmount = unitPrice * (buyersShare / 100);
      
      // Update main revenue totals
      creatorRevenue += creatorAmount;
      platformRevenue += platformAmount;
      promotionRevenue += promotionAmount;
      
      // Distribute buyers' share using dual pool system
      const numTokensInDistribution = currentSale - 1; // All tokens sold so far
      
      if (numTokensInDistribution > 0) {
        // Count tokens that haven't reached payback
        let notPaidBackCount = 0;
        for (let i = 1; i <= numTokensInDistribution; i++) {
          if (tokenEarnings[i] < paybackGoal) {
            notPaidBackCount++;
          }
        }
        
        // Calculate the two pools
        const nonPaybackPoolAmount = buyersAmount * (nonPaybackPoolSharePercent / 100);
        const sharedPoolAmount = buyersAmount * (paybackPoolSharePercent / 100);
        
        // Calculate per-token shares
        const nonPaybackSharePerToken = notPaidBackCount > 0 ? nonPaybackPoolAmount / notPaidBackCount : 0;
        const sharedSharePerToken = sharedPoolAmount / numTokensInDistribution;
        
        // Distribute shares and track payback status
        paidBackCount = 0;
        for (let i = 1; i <= numTokensInDistribution; i++) {
          const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
          
          // Every token gets a share from the shared pool
          let earning = sharedSharePerToken;
          
          // Tokens that haven't reached payback get an additional share
          if (!wasPaidBackBefore) {
            earning += nonPaybackSharePerToken;
          }
          
          // Update token earnings
          tokenEarnings[i] += earning;
          
          // Check if token reached payback threshold
          if (tokenEarnings[i] >= paybackGoal) {
            paidBackCount++;
            
            // Record payback point for the specific token we're tracking
            if (i === specificTokenNumber && paybackPoint === null) {
              paybackPoint = currentSale;
              totalRevenueAtPayback = totalRevenue;
              creatorRevenueAtPayback = creatorRevenue;
              platformRevenueAtPayback = platformRevenue;
            }
          }
        }
      }
    }
    
    // Get earnings for the specified token
    const buyerRevenue = specificTokenNumber <= totalSales ? tokenEarnings[specificTokenNumber] : 0;
    
    // Return comprehensive results
    return {
      creator: creatorRevenue,
      platform: platformRevenue,
      promotion: promotionRevenue,
      buyer: buyerRevenue,
      prepayersCount: numPrepayers,
      paidBackCount: paidBackCount,
      paybackPoint: paybackPoint,
      totalRevenueAtPayback: totalRevenueAtPayback,
      creatorRevenueAtPayback: creatorRevenueAtPayback,
      platformRevenueAtPayback: platformRevenueAtPayback,
      paybackGoal: paybackGoal,
      actualInitialInvestment: initialInvestment
    };
  }
  
  /**
   * Estimate payback point for a specific token
   * @param {Object} params - Parameters for estimation
   * @param {number} params.tokenNumber - The token number to estimate for
   * @param {number} params.tokenPrice - Price per token
   * @param {number} params.paybackRatio - The target payback multiplier
   * @param {number} params.nonPaybackPoolPercent - Priority percentage for tokens that haven't reached payback
   * @param {number} params.buyersShare - Share percentage allocated to buyers (0-1)
   * @return {Object} - Estimation results including paybackSale and ROI
   */
  estimateTokenPayback({ tokenNumber, tokenPrice, paybackRatio, nonPaybackPoolPercent, buyersShare }) {
    const goal = tokenPrice * paybackRatio;
    
    // Factors affecting payback speed
    const baseMultiplier = 1000; 
    const priorityFactor = nonPaybackPoolPercent;
    
    // Token position factor based on token number
    let tokenPositionFactor;
    
    if (tokenNumber <= 100) {
      // Early tokens (1-100)
      tokenPositionFactor = 0.8 + (tokenNumber / 500);
    } else if (tokenNumber <= 500) {
      // Mid-range tokens (101-500)
      tokenPositionFactor = 1.0 + Math.log10(tokenNumber / 100) * 0.5;
    } else {
      // Late tokens (501+)
      const lateTokenBase = 1.2 + Math.log10(tokenNumber / 500) * 0.3;
      
      if (nonPaybackPoolPercent >= 0.9) {
        // With very high non-payback priority, late tokens reach payback faster
        tokenPositionFactor = lateTokenBase * 0.8;
      } else if (nonPaybackPoolPercent >= 0.7) {
        // With medium priority
        tokenPositionFactor = lateTokenBase * 0.9;
      } else {
        // With low priority, late tokens take longer
        tokenPositionFactor = lateTokenBase * 1.1;
      }
    }
    
    // Calculate estimated sales needed for payback
    let paybackSale = Math.round(
      baseMultiplier * 
      paybackRatio * 
      (1 / buyersShare) * // Lower buyer share means more sales needed
      (1 / priorityFactor) * // Higher priority means fewer sales needed
      tokenPositionFactor // Position factor affects speed
    );
    
    // Adjust for distribution strategy
    if (nonPaybackPoolPercent >= 0.7) {
      // With high priority, mid-range tokens take longer than late tokens
      if (tokenNumber > 100 && tokenNumber <= 500) {
        paybackSale *= 1.1;
      }
    }
    
    // Adjust for edge cases
    if (nonPaybackPoolPercent <= 0.4 && tokenNumber > 500) {
      // With very low priority, late tokens take much longer
      paybackSale *= 1.15;
    }
    
    // Ensure minimum realistic payback sale number
    paybackSale = Math.max(paybackSale, tokenNumber + 100);
    
    // Calculate estimated ROI at payback
    const accumulatedEarnings = goal; // Assuming token reaches exact goal
    const roi = ((accumulatedEarnings / tokenPrice) * 100 - 100).toFixed(2);
    
    return {
      paybackSale,
      accumulatedEarnings,
      roi
    };
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
      } else if (key === 'promotion') {
        // Add support for promotion share
        if (!payouts.promotion) payouts.promotion = 0;
        payouts.promotion += share;
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
    
    // Find rules with remainder flag
    const remainderRules = Object.entries(scheme).filter(([_, rule]) => rule.remainder);
    
    // If no explicit remainder rules, add remainder to author
    if (remainderRules.length === 0 && 'author' in scheme) {
      payouts.author += remainder;
      return;
    }
    
    // Разделить остаток между всеми правилами с remainder: true
    const sharePerRule = remainder / remainderRules.length;
    
    // Process each remainder rule with its share of the remainder
    for (const [key, rule] of remainderRules) {
      if (key === 'author') {
        payouts.author += sharePerRule;
      } else if (key === 'platform') {
        payouts.platform += sharePerRule;
      } else if (key === 'promotion') {
        if (!payouts.promotion) payouts.promotion = 0;
        payouts.promotion += sharePerRule;
      } else if (key === 'allBuyers' || key.startsWith('buyers')) {
        this._processAllBuyersAllocation(sortedSales, payouts, sharePerRule);
      } else if (rule.count) {
        // Handle buyer group rules
        this._processGroupAllocation(rule, sortedSales, payouts, sharePerRule);
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
