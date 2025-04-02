/**
 * @fileoverview Main export file for the RevShare library
 * @author RevShare Library
 * @version 2.0.0
 */

// Export main class
import RevenueSharing from './core/RevenueSharing';
export { RevenueSharing };

// Export core components
import SchemeValidator from './core/SchemeValidator';
import PayoutCalculator from './core/PayoutCalculator';
export { SchemeValidator, PayoutCalculator };

// Export predefined schemes
import * as Schemes from './schemes';
export { Schemes };

// Export utility functions
import * as Utils from './utils';
export { Utils };

// Create default export
export default {
  RevenueSharing,
  SchemeValidator,
  PayoutCalculator,
  Schemes,
  Utils,
  
  /**
   * Create a new RevenueSharing instance
   * @param {Object} config - Configuration object
   * @return {RevenueSharing} - RevenueSharing instance
   */
  create(config) {
    return new RevenueSharing(config);
  },
  
  /**
   * Create a new Buy-to-Earn model instance
   * @param {Object} config - Configuration object
   * @param {string} config.productName - Product name
   * @param {number} config.unitPrice - Unit price
   * @param {number} config.initialInvestment - Initial investment amount
   * @param {number} [config.creatorShare=10] - Creator share percentage
   * @param {number} [config.platformShare=10] - Platform share percentage
   * @param {number} [config.promotionShare=10] - Promotion share percentage
   * @param {number} [config.paybackRatio=2] - Payback ratio multiplier
   * @param {number} [config.nonPaybackPoolSharePercent=60] - Non-payback pool percentage
   * @param {Object} [config.options] - Additional options
   * @return {RevenueSharing} - RevenueSharing instance configured for Buy-to-Earn
   */
  createBuyToEarn(config) {
    return new RevenueSharing({
      ...config,
      useBuyToEarnModel: true
    });
  },
  
  /**
   * Create a Buy-to-Earn instance using a predefined scheme
   * @param {Object} config - Basic configuration
   * @param {string} config.productName - Product name
   * @param {number} config.unitPrice - Unit price
   * @param {string} schemeName - Name of the predefined Buy-to-Earn scheme
   * @param {Object} [options] - Additional options
   * @return {RevenueSharing} - RevenueSharing instance
   */
  createFromBuyToEarnScheme(config, schemeName, options = {}) {
    const scheme = Schemes.BuyToEarnSchemes.getSchemeByName(schemeName);
    if (!scheme) {
      throw new Error(`Buy-to-Earn scheme '${schemeName}' not found`);
    }
    
    return this.createBuyToEarn({
      ...config,
      ...scheme,
      options
    });
  },
  
  /**
   * Get a predefined scheme by name
   * @param {string} schemeName - Name of the predefined scheme
   * @return {Object|null} - The scheme object or null if not found
   */
  getScheme(schemeName) {
    return Schemes.getSchemeByName(schemeName);
  },
  
  /**
   * Get all available schemes
   * @return {Array} - Array of all schemes with metadata
   */
  getAllSchemes() {
    return Schemes.getAllSchemes();
  },
  
  /**
   * Get all Buy-to-Earn schemes
   * @return {Array} - Array of Buy-to-Earn schemes with metadata
   */
  getBuyToEarnSchemes() {
    return Schemes.getBuyToEarnSchemes();
  },
  
  /**
   * Create a custom Buy-to-Earn scheme
   * @param {Object} params - Scheme parameters
   * @return {Object} - Custom Buy-to-Earn scheme
   */
  createCustomBuyToEarnScheme(params) {
    return Schemes.createCustomBuyToEarnScheme(params);
  },
  
  /**
   * Validate a revenue sharing scheme
   * @param {Object} scheme - Scheme to validate
   * @param {Object} [options] - Validation options
   * @return {Object} - Validation result
   */
  validateScheme(scheme, options) {
    const validator = new SchemeValidator();
    return validator.validate(scheme, options);
  },
  
  /**
   * Estimate token payback for Buy-to-Earn model
   * @param {Object} params - Estimation parameters
   * @param {number} params.tokenNumber - Token number to estimate for
   * @param {number} params.tokenPrice - Token price
   * @param {number} params.paybackRatio - Payback ratio
   * @param {number} params.nonPaybackPoolPercent - Non-payback pool percentage (0-1)
   * @param {number} params.buyersShare - Buyers' total share (0-1)
   * @return {Object} - Estimation result
   */
  estimateTokenPayback(params) {
    const calculator = new PayoutCalculator();
    return calculator.estimateTokenPayback(params);
  },
  
  /**
   * Library version
   * @type {string}
   */
  version: '2.0.0'
};
