/**
 * @fileoverview Main RevenueSharing class that manages product sales and calculates payouts
 * @author RevShare Library
 * @version 1.0.0
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
   * @param {Object} config.scheme - The revenue sharing scheme
   * @param {Object} [config.options] - Additional options
   * @param {boolean} [config.options.validateScheme=true] - Whether to validate the scheme on initialization
   * @param {boolean} [config.options.trackSaleTimestamp=true] - Whether to track sale timestamps
   */
  constructor({ productName, unitPrice, scheme, options = {} }) {
    // Default options
    this.options = {
      validateScheme: true,
      trackSaleTimestamp: true,
      ...options
    };
    
    this.productName = productName;
    this.unitPrice = unitPrice;
    this.scheme = deepClone(scheme);
    this.sales = [];
    
    // Initialize validator and calculator
    this.validator = new SchemeValidator();
    this.calculator = new PayoutCalculator();
    
    // Validate scheme if enabled
    if (this.options.validateScheme) {
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
   * Calculate payouts according to the scheme
   * @param {Object} [options] - Calculation options
   * @param {boolean} [options.roundResults=true] - Whether to round results to cents
   * @return {Object} - Calculated payouts for all parties
   */
  calculatePayouts(options = { roundResults: true }) {
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
    
    return {
      productName: this.productName,
      unitPrice: this.unitPrice,
      totalSales,
      totalRevenue,
      uniqueBuyers,
      ...timeframeStats
    };
  }
  
  /**
   * Export all data for backup or transfer
   * @return {Object} - All instance data
   */
  exportData() {
    return {
      productName: this.productName,
      unitPrice: this.unitPrice,
      scheme: deepClone(this.scheme),
      sales: deepClone(this.sales),
      options: deepClone(this.options)
    };
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
      if (!data.productName || typeof data.unitPrice !== 'number' || !data.scheme || !Array.isArray(data.sales)) {
        throw new Error('Invalid import data format');
      }
      
      const schemeValidation = this.validator.validate(data.scheme);
      if (!schemeValidation.isValid) {
        throw new Error(`Invalid imported scheme: ${schemeValidation.errors.join(', ')}`);
      }
    }
    
    this.productName = data.productName;
    this.unitPrice = data.unitPrice;
    this.scheme = deepClone(data.scheme);
    this.sales = deepClone(data.sales);
    this.options = { ...this.options, ...data.options };
    
    return true;
  }
  
  /**
   * Validate the current scheme
   * @return {Object} - Validation result
   */
  validateScheme() {
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
