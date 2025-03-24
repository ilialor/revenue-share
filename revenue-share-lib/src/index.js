/**
 * @fileoverview Main export file for the RevShare library
 * @author RevShare Library
 * @version 1.0.0
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
   * Library version
   * @type {string}
   */
  version: '1.0.0'
};
