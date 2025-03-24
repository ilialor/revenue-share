/**
 * @fileoverview Utility functions for validation in the Revenue Sharing library
 * @author RevShare Library
 * @version 1.0.0
 */

/**
 * Checks if a value is a positive number (greater than zero)
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a positive number
 */
export const isPositiveNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value > 0;
};

/**
 * Checks if a value is a non-negative number (zero or greater)
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a non-negative number
 */
export const isNonNegativeNumber = (value) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
};

/**
 * Checks if a value is a valid percentage (between 0 and 100 inclusive)
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a valid percentage
 */
export const isPercentage = (value) => {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100;
};

/**
 * Checks if a value is a positive integer
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a positive integer
 */
export const isPositiveInteger = (value) => {
  return typeof value === 'number' && !isNaN(value) && Number.isInteger(value) && value > 0;
};

/**
 * Checks if a value is an object (non-null and not an array)
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is an object
 */
export const isObject = (value) => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

/**
 * Checks if a value is a string
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a string
 */
export const isString = (value) => {
  return typeof value === 'string';
};

/**
 * Checks if a value is a valid buyer name
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a valid buyer name
 */
export const isValidBuyerName = (value) => {
  return isString(value) && value.trim().length > 0;
};

/**
 * Checks if a value is a valid product name
 * @param {any} value - The value to check
 * @returns {boolean} True if the value is a valid product name
 */
export const isValidProductName = (value) => {
  return isString(value) && value.trim().length > 0;
};

/**
 * Validates a revenue sharing scheme rule
 * @param {object} rule - The rule to validate
 * @returns {boolean} True if the rule is valid
 */
export const isValidSchemeRule = (rule) => {
  if (!isObject(rule)) {
    return false;
  }

  // Check for percentage rule
  if ('percentage' in rule) {
    if (!isPercentage(rule.percentage)) {
      return false;
    }

    // If has count, must be positive integer
    if ('count' in rule && !isPositiveInteger(rule.count)) {
      return false;
    }

    // If has fromEnd, must be used with count
    if (rule.fromEnd === true && !('count' in rule)) {
      return false;
    }

    // Cannot have both percentage and remainder
    if ('remainder' in rule) {
      return false;
    }

    return true;
  }

  // Check for remainder rule
  if ('remainder' in rule) {
    return rule.remainder === true;
  }

  // Must have either percentage or remainder
  return false;
};

/**
 * Validates a sale object
 * @param {object} sale - Sale object to validate
 * @returns {object} Validation result with isValid flag and errors array
 */
export const validateSale = (sale) => {
  const errors = [];
  
  if (!isObject(sale)) {
    errors.push('Sale must be an object');
    return { isValid: false, errors };
  }
  
  if (!isValidBuyerName(sale.buyer)) {
    errors.push('Sale must have a valid buyer name');
  }
  
  if ('timestamp' in sale && !isNonNegativeNumber(sale.timestamp)) {
    errors.push('If timestamp is provided, it must be a non-negative number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates library initialization parameters
 * @param {object} params - Parameters object
 * @returns {object} Validation result with isValid flag and errors array
 */
export const validateLibraryParams = (params) => {
  const errors = [];
  
  if (!isObject(params)) {
    errors.push('Parameters must be an object');
    return { isValid: false, errors };
  }
  
  if (!isValidProductName(params.productName)) {
    errors.push('Must provide a valid product name');
  }
  
  if (!isPositiveNumber(params.unitPrice)) {
    errors.push('Unit price must be a positive number');
  }
  
  if (!isObject(params.scheme)) {
    errors.push('Scheme must be an object');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a series of sales objects
 * @param {Array} sales - Array of sale objects
 * @returns {object} Validation result with isValid flag and errors array
 */
export const validateSales = (sales) => {
  const errors = [];
  
  if (!Array.isArray(sales)) {
    errors.push('Sales must be an array');
    return { isValid: false, errors };
  }
  
  sales.forEach((sale, index) => {
    const validationResult = validateSale(sale);
    if (!validationResult.isValid) {
      validationResult.errors.forEach(error => {
        errors.push(`Sale at index ${index}: ${error}`);
      });
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
