/**
 * @fileoverview Main RevenueSharing class that manages product sales and calculates payouts
 * @author RevShare Library
 * @version 2.0.0
 */

import SchemeValidator from './SchemeValidator';
import PayoutCalculator from './PayoutCalculator';
import { deepClone, roundToCents } from '../utils/MathUtils';

/**
 * Main class representing the RevenueSharing functionality
 */
class RevenueSharing {
  /**
   * Create a RevenueSharing instance
   * @param {Object} config - Configuration object
   * @param {string} config.productName - The name of the product
   * @param {number} config.unitPrice - The price per unit of the product
   * @param {Object} [config.scheme] - The revenue sharing scheme (optional if using buyToEarn model)
   * @param {boolean} [config.useBuyToEarnModel=false] - Whether to use Buy-to-Earn model
   * @param {number} [config.initialInvestment] - Initial investment amount (required for Buy-to-Earn model)
   * @param {number} [config.creatorShare=10] - Creator share percentage (for Buy-to-Earn model)
   * @param {number} [config.platformShare=10] - Platform share percentage (for Buy-to-Earn model)
   * @param {number} [config.promotionShare=10] - Promotion share percentage (for Buy-to-Earn model)
   * @param {number} [config.paybackRatio=2] - Payback ratio multiplier (for Buy-to-Earn model)
   * @param {number} [config.nonPaybackPoolSharePercent=60] - Percentage of buyers share that goes to non-paid-back tokens
   * @param {Object} [config.options] - Additional options
   * @param {boolean} [config.options.validateScheme=true] - Whether to validate the scheme on initialization
   * @param {boolean} [config.options.trackSaleTimestamp=true] - Whether to track sale timestamps
   */
  constructor({ 
    productName, 
    unitPrice, 
    scheme, 
    useBuyToEarnModel = false,
    initialInvestment,
    creatorShare = 10,
    platformShare = 10,
    promotionShare = 10,
    paybackRatio = 2,
    nonPaybackPoolSharePercent = 60,
    options = {} 
  }) {
    // Default options
    this.options = {
      validateScheme: true,
      trackSaleTimestamp: true,
      ...options
    };
    
    this.productName = productName;
    this.unitPrice = unitPrice;
    this.useBuyToEarnModel = useBuyToEarnModel;
    
    if (this.useBuyToEarnModel) {
      if (initialInvestment === undefined) {
        throw new Error('Initial investment is required for Buy-to-Earn model');
      }
      this.initialInvestment = initialInvestment;
      this.creatorShare = creatorShare;
      this.platformShare = platformShare;
      this.promotionShare = promotionShare;
      this.buyersShare = 100 - creatorShare - platformShare - promotionShare;
      this.paybackRatio = paybackRatio;
      this.nonPaybackPoolSharePercent = nonPaybackPoolSharePercent;
      this.paybackPoolSharePercent = 100 - nonPaybackPoolSharePercent;
    } else {
      if (!scheme) {
        throw new Error('Scheme is required for standard revenue sharing model');
      }
      this.scheme = deepClone(scheme);
    }
    
    this.sales = [];
    
    // Initialize validator and calculator
    this.validator = new SchemeValidator();
    this.calculator = new PayoutCalculator();
    
    // Validate scheme if enabled and not using Buy-to-Earn model
    if (!this.useBuyToEarnModel && this.options.validateScheme) {
      const validationResult = this.validator.validate(this.scheme);
      if (!validationResult.isValid) {
        throw new Error(`Invalid scheme: ${validationResult.errors.join(', ')}`);
      }
    }
  }
  
  /**
   * Add a single sale to the system
   * @param {Object} saleData - Data about the sale
   * @param {string} saleData.buyer - Identifier of the buyer
   * @param {number} [saleData.timestamp] - Optional timestamp of the sale
   * @param {Object} [saleData.metadata] - Optional metadata about the sale
   * @return {number} - Index of the added sale
   */
  addSale({ buyer, timestamp = Date.now(), metadata = {} }) {
    if (!buyer) {
      throw new Error('Buyer identifier is required for each sale');
    }
    
    const sale = {
      buyer,
      metadata,
      // Only add timestamp if tracking is enabled
      ...(this.options.trackSaleTimestamp ? { timestamp } : {})
    };
    
    this.sales.push(sale);
    return this.sales.length - 1;
  }
  
  /**
   * Add multiple sales at once
   * @param {Array<Object>} salesArray - Array of sale data objects
   * @return {number} - Number of sales added
   */
  addSales(salesArray) {
    if (!Array.isArray(salesArray)) {
      throw new Error('Expected an array of sales');
    }
    
    const initialCount = this.sales.length;
    
    salesArray.forEach(sale => {
      this.addSale(sale);
    });
    
    return this.sales.length - initialCount;
  }
  
  /**
   * Calculate number of prepayers needed to cover initial investment
   * @return {number} - Number of prepayers
   */
  calculateNumPrepayers() {
    if (!this.useBuyToEarnModel) {
      return 0;
    }
    
    if (isNaN(this.unitPrice) || this.unitPrice <= 0 || this.initialInvestment <= 0) {
      return 0;
    }
    
    return Math.ceil(parseFloat(this.initialInvestment) / this.unitPrice);
  }
  
  /**
   * Calculate payouts according to the scheme or Buy-to-Earn model
   * @param {Object} [options] - Calculation options
   * @param {boolean} [options.roundResults=true] - Whether to round results to cents
   * @param {number} [options.specificTokenNumber] - For Buy-to-Earn model, calculate accrued revenue for a specific token
   * @return {Object} - Calculated payouts for all parties
   */
  calculatePayouts(options = { roundResults: true, specificTokenNumber: null }) {
    if (this.useBuyToEarnModel) {
      return this._calculateBuyToEarnPayouts(options);
    } else {
      return this._calculateStandardPayouts(options);
    }
  }
  
  /**
   * Calculate payouts using standard scheme
   * @param {Object} options - Calculation options
   * @return {Object} - Calculated payouts
   * @private
   */
  _calculateStandardPayouts(options) {
    const calculationData = {
      sales: this.sales,
      scheme: this.scheme,
      unitPrice: this.unitPrice,
      totalRevenue: this.sales.length * this.unitPrice
    };
    
    const rawPayouts = this.calculator.calculate(calculationData);
    
    // Apply rounding if needed
    if (options.roundResults) {
      return this._roundResults(rawPayouts);
    }
    
    return rawPayouts;
  }
  
  /**
   * Calculate payouts using Buy-to-Earn model
   * @param {Object} options - Calculation options
   * @return {Object} - Calculated payouts with accrued revenue
   * @private
   */
  _calculateBuyToEarnPayouts(options) {
    const totalSales = this.sales.length;
    const tokenPrice = this.unitPrice;
    const yourTokenNumber = options.specificTokenNumber || 1;
    
    // Calculate derived values
    const initialInvestment = parseFloat(this.initialInvestment);
    const numPrepayers = this.calculateNumPrepayers();
    const paybackGoal = tokenPrice * this.paybackRatio;

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

    // Shares for post-prepayment phase
    const creatorSharePercent = parseFloat(this.creatorShare);
    const platformSharePercent = parseFloat(this.platformShare);
    const promotionSharePercent = parseFloat(this.promotionShare);
    const buyersSharePercent = 100 - creatorSharePercent - platformSharePercent - promotionSharePercent;
    
    // Initialize all balances
    let creatorRevenue = initialInvestment; // Creator gets full prepayment
    let platformRevenue = 0;
    let promotionRevenue = 0;
    let totalRevenue = initialInvestment; // Start with initial investment
    
    // For tracking payback status
    let tokenEarnings = new Array(totalSales + 1).fill(0);
    let paidBackCount = 0;
    
    // Для отслеживания момента окупаемости
    let paybackPoint = null;
    let totalRevenueAtPayback = 0;
    let creatorRevenueAtPayback = 0;
    let platformRevenueAtPayback = 0;
    
    // Simulate sales post-prepayment
    for (let currentSale = numPrepayers + 1; currentSale <= totalSales; currentSale++) {
        // Increment total revenue with each sale
        totalRevenue += tokenPrice;
        
        // Calculate shares for this sale
        const creatorShare = tokenPrice * (creatorSharePercent / 100);
        const platformShare = tokenPrice * (platformSharePercent / 100);
        const promotionShare = tokenPrice * (promotionSharePercent / 100);
        const buyersShare = tokenPrice * (buyersSharePercent / 100);
        
        // Update revenue totals
        creatorRevenue += creatorShare;
        platformRevenue += platformShare;
        promotionRevenue += promotionShare;
        
        // Count tokens that haven't reached payback yet
        // and distribute buyers' share
        const numTokensInDistribution = currentSale - 1;
        if (numTokensInDistribution > 0) {
            // 1. Count tokens in each pool
            let notPaidBackCount = 0;
            for (let i = 1; i <= numTokensInDistribution; i++) {
                if (tokenEarnings[i] < paybackGoal) {
                    notPaidBackCount++;
                }
            }
            
            // 2. Calculate the two pools
            const nonPaybackPoolShare = buyersShare * (this.nonPaybackPoolSharePercent / 100);
            const sharedPoolShare = buyersShare * (this.paybackPoolSharePercent / 100);
            
            // 3. Calculate per-token shares
            const nonPaybackSharePerToken = notPaidBackCount > 0 ? nonPaybackPoolShare / notPaidBackCount : 0;
            const sharedSharePerToken = sharedPoolShare / numTokensInDistribution;
            
            // 4. Distribute earnings and count paid back tokens
            paidBackCount = 0;
            for (let i = 1; i <= numTokensInDistribution; i++) {
                const wasPaidBackBefore = tokenEarnings[i] >= paybackGoal;
                
                // Every token gets a share from the shared pool
                let earning = sharedSharePerToken;
                
                // Tokens that haven't reached payback also get a share from the non-payback pool
                if (!wasPaidBackBefore) {
                    earning += nonPaybackSharePerToken;
                }
                
                // Update token earnings
                tokenEarnings[i] += earning;
                
                // Check if this token has reached payback
                if (tokenEarnings[i] >= paybackGoal) {
                    paidBackCount++;
                    
                    // If this is the tracked token and the payback point has not been recorded yet
                    if (i === yourTokenNumber && paybackPoint === null) {
                        paybackPoint = currentSale;
                        totalRevenueAtPayback = totalRevenue;
                        creatorRevenueAtPayback = creatorRevenue;
                        platformRevenueAtPayback = platformRevenue;
                    }
                }
            }
        }
    }
    
    // Get the final earnings for the token we're interested in
    const buyerRevenue = yourTokenNumber <= totalSales ? tokenEarnings[yourTokenNumber] : 0;
    
    const result = {
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
    
    // Apply rounding if needed
    if (options.roundResults) {
      result.creator = roundToCents(result.creator);
      result.platform = roundToCents(result.platform);
      result.promotion = roundToCents(result.promotion);
      result.buyer = roundToCents(result.buyer);
      result.totalRevenueAtPayback = roundToCents(result.totalRevenueAtPayback);
      result.creatorRevenueAtPayback = roundToCents(result.creatorRevenueAtPayback);
      result.platformRevenueAtPayback = roundToCents(result.platformRevenueAtPayback);
    }
    
    return result;
  }
  
  /**
   * Estimate payback point for a specific token
   * @param {number} tokenNumber - The token number to estimate for
   * @return {Object} - Payback estimation data
   */
  estimateTokenPayback(tokenNumber) {
    if (!this.useBuyToEarnModel) {
      throw new Error('Token payback estimation is only available for Buy-to-Earn model');
    }
    
    const tokenPrice = this.unitPrice;
    const goal = tokenPrice * this.paybackRatio;
    const nonPaybackPoolPercent = this.nonPaybackPoolSharePercent / 100;
    const buyersShare = this.buyersShare / 100;
    
    // Факторы влияния на окупаемость
    const baseMultiplier = 1000; // Базовое количество продаж для калибровки
    
    // Влияние приоритета неокупившихся (обратная зависимость)
    // Чем выше nonPaybackPoolPercent, тем быстрее окупаемость
    const priorityFactor = nonPaybackPoolPercent;
    
    // Влияние позиции токена (сложная логарифмическая зависимость)
    let tokenPositionFactor;
    
    if (tokenNumber <= 100) {
      // Ранние токены
      tokenPositionFactor = 0.8 + (tokenNumber / 500);
    } else if (tokenNumber <= 500) {
      // Средние токены - нелинейный рост сложности окупаемости
      tokenPositionFactor = 1.0 + Math.log10(tokenNumber / 100) * 0.5;
    } else {
      // Поздние токены
      const lateTokenBase = 1.2 + Math.log10(tokenNumber / 500) * 0.3;
      
      if (nonPaybackPoolPercent >= 0.9) {
        // При очень высоком приоритете неокупившихся поздним токенам легче
        tokenPositionFactor = lateTokenBase * 0.8;
      } else if (nonPaybackPoolPercent >= 0.7) {
        // При среднем приоритете
        tokenPositionFactor = lateTokenBase * 0.9;
      } else {
        // При низком приоритете поздним токенам труднее
        tokenPositionFactor = lateTokenBase * 1.1;
      }
    }
    
    // Расчет количества продаж до окупаемости с учетом всех факторов
    let paybackSale = Math.round(
      baseMultiplier * 
      this.paybackRatio * 
      (1 / buyersShare) * // Чем меньше доля покупателей, тем больше продаж нужно
      (1 / priorityFactor) * // Чем выше приоритет неокупившихся, тем меньше продаж нужно
      tokenPositionFactor // Влияние позиции токена с учетом стратегий распределения
    );
    
    // Корректировка для обеспечения правильного порядка окупаемости
    if (nonPaybackPoolPercent >= 0.7) {
      // При высоком приоритете средние токены окупаются дольше, чем поздние
      if (tokenNumber > 100 && tokenNumber <= 500) {
        paybackSale *= 1.1;
      }
    }
    
    // Для учета края графика зависимости
    if (nonPaybackPoolPercent <= 0.4 && tokenNumber > 500) {
      // При очень низком приоритете неокупившихся поздним токенам еще труднее
      paybackSale *= 1.15;
    }
    
    // Минимальное значение для paybackSale
    paybackSale = Math.max(paybackSale, tokenNumber + 100);
    
    // Оценка накопленных доходов и ROI
    let accumulatedEarnings = goal; // Предполагаем, что к моменту окупаемости токен получит свою цель
    let roi = ((accumulatedEarnings / tokenPrice) * 100 - 100).toFixed(2);
    
    return {
      paybackSale,
      accumulatedEarnings,
      roi
    };
  }
  
  /**
   * Get statistics about the sales
   * @return {Object} - Sales statistics
   */
  getSalesStats() {
    const totalSales = this.sales.length;
    const totalRevenue = totalSales * this.unitPrice;
    
    const uniqueBuyers = new Set(this.sales.map(sale => sale.buyer)).size;
    
    // Create timeframe stats if timestamps are tracked
    let timeframeStats = {};
    if (this.options.trackSaleTimestamp && totalSales > 0) {
      const timestamps = this.sales.map(sale => sale.timestamp);
      timeframeStats = {
        firstSaleDate: new Date(Math.min(...timestamps)),
        lastSaleDate: new Date(Math.max(...timestamps)),
        salesDuration: Math.max(...timestamps) - Math.min(...timestamps)
      };
    }
    
    const baseStats = {
      productName: this.productName,
      unitPrice: this.unitPrice,
      totalSales,
      totalRevenue,
      uniqueBuyers,
      ...timeframeStats
    };
    
    // Add Buy-to-Earn specific stats if that model is used
    if (this.useBuyToEarnModel) {
      const numPrepayers = this.calculateNumPrepayers();
      return {
        ...baseStats,
        initialInvestment: this.initialInvestment,
        numPrepayers,
        postPrepaymentSales: Math.max(0, totalSales - numPrepayers),
        creatorShare: this.creatorShare,
        platformShare: this.platformShare,
        promotionShare: this.promotionShare,
        buyersShare: this.buyersShare,
        paybackRatio: this.paybackRatio,
        paybackGoal: this.unitPrice * this.paybackRatio,
        nonPaybackPoolSharePercent: this.nonPaybackPoolSharePercent,
        paybackPoolSharePercent: this.paybackPoolSharePercent
      };
    }
    
    return baseStats;
  }
  
  /**
   * Export all data for backup or transfer
   * @return {Object} - All instance data
   */
  exportData() {
    const data = {
      productName: this.productName,
      unitPrice: this.unitPrice,
      sales: deepClone(this.sales),
      options: deepClone(this.options),
      useBuyToEarnModel: this.useBuyToEarnModel
    };
    
    if (this.useBuyToEarnModel) {
      data.initialInvestment = this.initialInvestment;
      data.creatorShare = this.creatorShare;
      data.platformShare = this.platformShare;
      data.promotionShare = this.promotionShare;
      data.paybackRatio = this.paybackRatio;
      data.nonPaybackPoolSharePercent = this.nonPaybackPoolSharePercent;
    } else {
      data.scheme = deepClone(this.scheme);
    }
    
    return data;
  }
  
  /**
   * Import data from a previous export
   * @param {Object} data - Data to import
   * @param {boolean} [validate=true] - Whether to validate the imported data
   * @return {boolean} - Success status
   */
  importData(data, validate = true) {
    if (validate) {
      // Validate imported data
      if (!data.productName || typeof data.unitPrice !== 'number' || !Array.isArray(data.sales)) {
        throw new Error('Invalid import data format');
      }
      
      if (!data.useBuyToEarnModel && (!data.scheme || this.validator.validate(data.scheme).isValid === false)) {
        throw new Error('Invalid imported scheme');
      }
      
      if (data.useBuyToEarnModel && (
        typeof data.initialInvestment !== 'number' ||
        typeof data.creatorShare !== 'number' ||
        typeof data.platformShare !== 'number' ||
        typeof data.promotionShare !== 'number' ||
        typeof data.paybackRatio !== 'number' ||
        typeof data.nonPaybackPoolSharePercent !== 'number'
      )) {
        throw new Error('Invalid Buy-to-Earn parameters in imported data');
      }
    }
    
    this.productName = data.productName;
    this.unitPrice = data.unitPrice;
    this.sales = deepClone(data.sales);
    this.options = { ...this.options, ...data.options };
    this.useBuyToEarnModel = data.useBuyToEarnModel;
    
    if (this.useBuyToEarnModel) {
      this.initialInvestment = data.initialInvestment;
      this.creatorShare = data.creatorShare;
      this.platformShare = data.platformShare;
      this.promotionShare = data.promotionShare;
      this.paybackRatio = data.paybackRatio;
      this.nonPaybackPoolSharePercent = data.nonPaybackPoolSharePercent;
      this.paybackPoolSharePercent = 100 - this.nonPaybackPoolSharePercent;
      this.buyersShare = 100 - this.creatorShare - this.platformShare - this.promotionShare;
    } else {
      this.scheme = deepClone(data.scheme);
    }
    
    return true;
  }
  
  /**
   * Validate the current scheme (only for standard model)
   * @return {Object} - Validation result
   */
  validateScheme() {
    if (this.useBuyToEarnModel) {
      return { isValid: true, errors: [] };
    }
    return this.validator.validate(this.scheme);
  }
  
  /**
   * Round calculation results to cents
   * @param {Object} payouts - Raw payout results
   * @return {Object} - Rounded payout results
   * @private
   */
  _roundResults(payouts) {
    const result = { ...payouts };
    
    // Round author and platform values
    if (typeof result.author === 'number') {
      result.author = roundToCents(result.author);
    }
    
    if (typeof result.platform === 'number') {
      result.platform = roundToCents(result.platform);
    }
    
    // Round buyer values
    if (result.buyers) {
      Object.keys(result.buyers).forEach(buyer => {
        result.buyers[buyer] = roundToCents(result.buyers[buyer]);
      });
    }
    
    return result;
  }
}

export default RevenueSharing;
