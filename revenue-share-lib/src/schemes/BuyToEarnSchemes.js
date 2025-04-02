/**
 * @fileoverview Buy-to-Earn specific revenue sharing schemes
 * @author RevShare Library
 * @version 1.0.0
 */

/**
 * Standard Buy-to-Earn model with balanced distribution
 * Provides equal shares between creator, platform and promotion with balanced payback strategy
 * @type {Object}
 */
export const STANDARD = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 10,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model with higher creator share
 * Prioritizes creator income with a standard payback approach
 * @type {Object}
 */
export const CREATOR_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 20,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model with higher platform share
 * Prioritizes platform income with a standard payback approach
 * @type {Object}
 */
export const PLATFORM_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 20,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model optimized for faster early investor payback
 * Creates distinct "waves" of payback, where early investors reach payback much faster
 * @type {Object}
 */
export const EARLY_PAYBACK = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 95 // Higher priority for non-payback tokens
};

/**
 * Buy-to-Earn model with more equal distribution rate
 * Makes payback more equal among all investors, reducing early investor advantage
 * @type {Object}
 */
export const EQUAL_DISTRIBUTION = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 25 // Low priority for non-payback tokens, more equal distribution
};

/**
 * Buy-to-Earn model with larger payback goal
 * Requires more sales for investors to reach payback, but higher total return
 * @type {Object}
 */
export const HIGH_PAYBACK = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 3, // Higher payback goal
  nonPaybackPoolSharePercent: 80
};

/**
 * Buy-to-Earn model focused on faster promotion
 * Allocates more resources to marketing and promotion activities
 * @type {Object}
 */
export const PROMOTION_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 25, // Higher promotion share
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 75
};

/**
 * Buy-to-Earn model for smaller initial investments
 * Lower initial capital requirement with balanced distribution
 * @type {Object}
 */
export const SMALL_INVESTMENT = {
  initialInvestment: 100000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 10,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 70
};

/**
 * Buy-to-Earn model for larger initial investments
 * Higher initial capital with more creator share
 * @type {Object}
 */
export const LARGE_INVESTMENT = {
  initialInvestment: 500000,
  creatorShare: 15,
  platformShare: 10,
  promotionShare: 15,
  paybackRatio: 2.5,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model with quick payback target
 * Lower payback ratio for faster investor ROI
 * @type {Object}
 */
export const QUICK_PAYBACK = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 1.5, // Lower payback target
  nonPaybackPoolSharePercent: 90 // Strong priority for non-payback tokens
};

/**
 * Buy-to-Earn balanced model with buyer incentives
 * Favors the buyers with higher share allocation
 * @type {Object}
 */
export const BUYER_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 8,
  platformShare: 8,
  promotionShare: 8,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 75
};

/**
 * Creates a custom Buy-to-Earn scheme with specified parameters
 * 
 * @param {Object} params - Scheme parameters
 * @param {number} [params.initialInvestment=300000] - Initial investment amount
 * @param {number} [params.creatorShare=10] - Creator share percentage
 * @param {number} [params.platformShare=10] - Platform share percentage
 * @param {number} [params.promotionShare=10] - Promotion share percentage 
 * @param {number} [params.paybackRatio=2] - Payback ratio multiplier
 * @param {number} [params.nonPaybackPoolSharePercent=60] - Non-paid-back tokens' pool percentage
 * @returns {Object} - Custom Buy-to-Earn scheme
 */
export function createCustomScheme({
  initialInvestment = 300000,
  creatorShare = 10,
  platformShare = 10, 
  promotionShare = 10,
  paybackRatio = 2,
  nonPaybackPoolSharePercent = 60
} = {}) {
  // Validate parameters
  if (initialInvestment <= 0) {
    throw new Error('Initial investment must be a positive number');
  }
  
  if (creatorShare < 0 || platformShare < 0 || promotionShare < 0) {
    throw new Error('Share percentages cannot be negative');
  }
  
  if (creatorShare + platformShare + promotionShare > 100) {
    throw new Error('Total share percentages cannot exceed 100%');
  }
  
  if (paybackRatio < 1) {
    throw new Error('Payback ratio must be at least 1.0');
  }
  
  if (nonPaybackPoolSharePercent < 0 || nonPaybackPoolSharePercent > 100) {
    throw new Error('Non-payback pool share must be between 0 and 100');
  }
  
  return {
    initialInvestment,
    creatorShare,
    platformShare,
    promotionShare,
    paybackRatio,
    nonPaybackPoolSharePercent
  };
}

/**
 * A map of all predefined Buy-to-Earn schemes for easy access
 * @type {Object}
 */
export const SCHEME_MAP = {
  STANDARD,
  CREATOR_FOCUSED,
  PLATFORM_FOCUSED,
  EARLY_PAYBACK,
  EQUAL_DISTRIBUTION,
  HIGH_PAYBACK,
  PROMOTION_FOCUSED,
  SMALL_INVESTMENT,
  LARGE_INVESTMENT,
  QUICK_PAYBACK,
  BUYER_FOCUSED
};

/**
 * Get a scheme by name
 * @param {string} name - Name of the scheme to retrieve
 * @returns {Object|null} - The scheme if found, null otherwise
 */
export function getSchemeByName(name) {
  return SCHEME_MAP[name] || null;
}

/**
 * Get list of all available scheme names
 * @returns {string[]} - Array of scheme names
 */
export function getAllSchemeNames() {
  return Object.keys(SCHEME_MAP);
}

/**
 * Get all schemes with metadata for display
 * @returns {Array<Object>} - Array of schemes with metadata
 */
export function getAllSchemesWithMetadata() {
  return Object.entries(SCHEME_MAP).map(([name, scheme]) => ({
    name,
    scheme,
    buyersShare: 100 - scheme.creatorShare - scheme.platformShare - scheme.promotionShare,
    paybackPoolSharePercent: 100 - scheme.nonPaybackPoolSharePercent
  }));
} 