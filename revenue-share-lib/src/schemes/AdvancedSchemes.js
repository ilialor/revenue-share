/**
 * @fileoverview Advanced revenue sharing schemes
 * @author RevShare Library
 * @version 1.0.0
 */

/**
 * Sliding window scheme with different allocations for different buyer groups
 * @type {Object}
 */
export const SLIDING_WINDOW = {
  author: { percentage: 10 },
  platform: { percentage: 7 },
  first500: { count: 500, percentage: 5 },
  last5000: { count: 5000, percentage: 70, fromEnd: true },
  allBuyers: { percentage: 8 }
};

/**
 * Multi-tier early adopter scheme that heavily rewards the first buyers
 * @type {Object}
 */
export const EARLY_ADOPTER_TIERS = {
  author: { percentage: 20 },
  platform: { percentage: 15 },
  first100: { count: 100, percentage: 25 },
  first1000: { count: 1000, percentage: 20 },
  first10000: { count: 10000, percentage: 15 },
  allBuyers: { percentage: 5 }
};

/**
 * Creator economy scheme emphasizing the author's work
 * @type {Object}
 */
export const CREATOR_ECONOMY = {
  author: { percentage: 60 },
  platform: { percentage: 10 },
  first1000: { count: 1000, percentage: 20 },
  allBuyers: { percentage: 10 }
};

/**
 * Community-driven scheme with most revenue going back to the buyers
 * @type {Object}
 */
export const COMMUNITY_DRIVEN = {
  author: { percentage: 15 },
  platform: { percentage: 10 },
  first5000: { count: 5000, percentage: 15 },
  allBuyers: { percentage: 60 }
};

/**
 * ICO-like scheme that heavily rewards early adopters
 * @type {Object}
 */
export const ICO_MODEL = {
  author: { percentage: 15 },
  platform: { percentage: 10 },
  first100: { count: 100, percentage: 30 },
  first1000: { count: 1000, percentage: 25 },
  first10000: { count: 10000, percentage: 15 },
  allBuyers: { percentage: 5 }
};

/**
 * Crowdfunding model with author getting most of the revenue
 * @type {Object}
 */
export const CROWDFUNDING_MODEL = {
  author: { percentage: 75 },
  platform: { percentage: 15 },
  first1000: { count: 1000, percentage: 7 },
  allBuyers: { percentage: 3 }
};

/**
 * Dynamic tiered model with the last buyers getting a larger share
 * @type {Object}
 */
export const DYNAMIC_TIERED = {
  author: { percentage: 30 },
  platform: { percentage: 10 },
  first1000: { count: 1000, percentage: 10 },
  last1000: { count: 1000, percentage: 40, fromEnd: true },
  allBuyers: { percentage: 10 }
};

/**
 * Platform growth model that incentivizes the platform
 * @type {Object}
 */
export const PLATFORM_GROWTH = {
  author: { percentage: 25 },
  platform: { percentage: 45 },
  first500: { count: 500, percentage: 20 },
  allBuyers: { percentage: 10 }
};

/**
 * Creates a custom advanced revenue sharing scheme
 * @param {Object} options - Configuration options for the scheme
 * @param {number} options.authorPercentage - Percentage allocated to the author
 * @param {number} options.platformPercentage - Percentage allocated to the platform
 * @param {number} options.earlyBuyersCount - Number of early buyers
 * @param {number} options.earlyBuyersPercentage - Percentage allocated to early buyers
 * @param {number} options.lateBuyersCount - Number of late buyers
 * @param {number} options.lateBuyersPercentage - Percentage allocated to late buyers
 * @param {number} options.allBuyersPercentage - Percentage allocated to all buyers
 * @returns {Object} Custom advanced revenue sharing scheme
 */
export function createCustomAdvancedScheme({
  authorPercentage,
  platformPercentage,
  earlyBuyersCount,
  earlyBuyersPercentage,
  lateBuyersCount,
  lateBuyersPercentage,
  allBuyersPercentage
}) {
  return {
    author: { percentage: authorPercentage },
    platform: { percentage: platformPercentage },
    earlyBuyers: { count: earlyBuyersCount, percentage: earlyBuyersPercentage },
    lateBuyers: { count: lateBuyersCount, percentage: lateBuyersPercentage },
    allBuyers: { percentage: allBuyersPercentage }
  };
}
