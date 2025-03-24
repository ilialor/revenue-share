/**
 * @fileoverview Validator for revenue sharing schemes
 * @author RevShare Library
 * @version 1.0.0
 */

import { isNumeric, sum } from '../utils/MathUtils';
import { SCHEME_KEYS } from '../utils/ValidationUtils';

/**
 * Class responsible for validating revenue sharing schemes
 */
class SchemeValidator {
  /**
   * Validate a revenue sharing scheme
   * @param {Object} scheme - The scheme to validate
   * @param {Object} [options] - Validation options
   * @param {boolean} [options.strictPercentageTotal=false] - Whether percentages must add up to exactly 100%
   * @param {boolean} [options.allowRemainderOverride=true] - Whether to allow remainder to override percentage allocations
   * @return {Object} - Validation result with isValid flag and errors array
   */
  validate(scheme, options = {}) {
    const defaultOptions = {
      strictPercentageTotal: false,
      allowRemainderOverride: true
    };
    
    const validationOptions = { ...defaultOptions, ...options };
    const errors = [];
    
    // Check if scheme is an object
    if (!scheme || typeof scheme !== 'object' || Array.isArray(scheme)) {
      return {
        isValid: false,
        errors: ['Scheme must be a non-null object']
      };
    }
    
    // Scheme must have at least one key
    if (Object.keys(scheme).length === 0) {
      return {
        isValid: false,
        errors: ['Scheme cannot be empty']
      };
    }
    
    // Validate each scheme key
    this._validateSchemeEntries(scheme, errors);
    
    // Check percentage total if strict mode is enabled
    if (validationOptions.strictPercentageTotal) {
      this._validatePercentageTotal(scheme, errors);
    }
    
    // Check for multiple remainder flags
    this._validateRemainderFlags(scheme, errors, validationOptions.allowRemainderOverride);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: this._generateWarnings(scheme)
    };
  }
  
  /**
   * Validate individual scheme entries
   * @param {Object} scheme - The scheme to validate
   * @param {Array} errors - Array to collect validation errors
   * @private
   */
  _validateSchemeEntries(scheme, errors) {
    Object.entries(scheme).forEach(([key, rule]) => {
      // Each rule must be an object
      if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
        errors.push(`Rule for '${key}' must be a non-null object`);
        return;
      }
      
      // Check percentage value if present
      if ('percentage' in rule) {
        if (!isNumeric(rule.percentage) || rule.percentage < 0 || rule.percentage > 100) {
          errors.push(`Percentage for '${key}' must be a number between 0 and 100`);
        }
      }
      
      // Check count value if present
      if ('count' in rule) {
        if (!Number.isInteger(rule.count) || rule.count <= 0) {
          errors.push(`Count for '${key}' must be a positive integer`);
        }
      }
      
      // Check fromEnd value if present
      if ('fromEnd' in rule && typeof rule.fromEnd !== 'boolean') {
        errors.push(`FromEnd for '${key}' must be a boolean`);
      }
      
      // Check remainder value if present
      if ('remainder' in rule && typeof rule.remainder !== 'boolean') {
        errors.push(`Remainder for '${key}' must be a boolean`);
      }
      
      // Rules with count must have either percentage or remainder
      if ('count' in rule && !('percentage' in rule) && !('remainder' in rule)) {
        errors.push(`Rule for '${key}' with count must specify either percentage or remainder`);
      }
      
      // Rules cannot have both percentage and remainder
      if ('percentage' in rule && 'remainder' in rule) {
        errors.push(`Rule for '${key}' cannot have both percentage and remainder`);
      }
    });
  }
  
  /**
   * Validate that percentages add up to 100%
   * @param {Object} scheme - The scheme to validate
   * @param {Array} errors - Array to collect validation errors
   * @private
   */
  _validatePercentageTotal(scheme, errors) {
    const percentageTotal = Object.values(scheme)
      .filter(rule => 'percentage' in rule)
      .reduce((total, rule) => total + rule.percentage, 0);
    
    if (Math.abs(percentageTotal - 100) > 0.01) {
      errors.push(`Total percentage allocation (${percentageTotal}%) must equal 100%`);
    }
  }
  
  /**
   * Validate remainder flags
   * @param {Object} scheme - The scheme to validate
   * @param {Array} errors - Array to collect validation errors
   * @param {boolean} allowOverride - Whether to allow remainder to override percentage allocations
   * @private
   */
  _validateRemainderFlags(scheme, errors, allowOverride) {
    const remainderRules = Object.entries(scheme)
      .filter(([key, rule]) => rule.remainder === true);
    
    // Check if multiple rules have remainder flag
    if (remainderRules.length > 1) {
      errors.push(`Only one rule can have remainder flag, found ${remainderRules.length}: ${remainderRules.map(([key]) => key).join(', ')}`);
    }
  }
  
  /**
   * Generate warnings that don't invalidate the scheme but might be issues
   * @param {Object} scheme - The scheme to validate
   * @return {Array} - Array of warning messages
   * @private
   */
  _generateWarnings(scheme) {
    const warnings = [];
    
    // Check if there's a remainder rule
    const hasRemainderRule = Object.values(scheme).some(rule => rule.remainder === true);
    
    // Check percentage total
    const percentageTotal = Object.values(scheme)
      .filter(rule => 'percentage' in rule)
      .reduce((total, rule) => total + rule.percentage, 0);
    
    // Warn if percentages don't add up to 100% and there's no remainder rule
    if (Math.abs(percentageTotal - 100) > 0.01 && !hasRemainderRule) {
      warnings.push(`Total percentage allocation (${percentageTotal}%) doesn't equal 100% and no remainder rule is defined`);
    }
    
    // Warn about count rules that might apply to more sales than exist
    const countRules = Object.entries(scheme)
      .filter(([key, rule]) => 'count' in rule);
    
    if (countRules.length > 1) {
      warnings.push(`Multiple count rules (${countRules.length}) might overlap or apply to more buyers than exist`);
    }
    
    return warnings;
  }
  
  /**
   * Get recommended fixes for validation errors
   * @param {Object} scheme - The invalid scheme
   * @param {Array} errors - Validation errors
   * @return {Object} - Scheme with recommended fixes
   */
  suggestFixes(scheme, errors) {
    if (!errors || errors.length === 0) {
      return { ...scheme };
    }
    
    const fixedScheme = { ...scheme };
    
    // Fix percentage total if needed
    const percentageTotal = Object.values(fixedScheme)
      .filter(rule => 'percentage' in rule)
      .reduce((total, rule) => total + rule.percentage, 0);
    
    // If percentages exceed 100%, scale them down
    if (percentageTotal > 100) {
      const scaleFactor = 100 / percentageTotal;
      Object.values(fixedScheme).forEach(rule => {
        if ('percentage' in rule) {
          rule.percentage = Math.round(rule.percentage * scaleFactor * 100) / 100;
        }
      });
    }
    
    // If no remainder rule and percentages don't add up to 100%, add remainder to author
    if (percentageTotal < 100 && !Object.values(fixedScheme).some(rule => rule.remainder)) {
      if (fixedScheme.author) {
        fixedScheme.author.remainder = true;
      } else {
        fixedScheme.author = { remainder: true };
      }
    }
    
    return fixedScheme;
  }
}

export default SchemeValidator;
