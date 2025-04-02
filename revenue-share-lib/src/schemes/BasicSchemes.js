/**
 * @fileoverview Basic revenue sharing schemes
 * @author RevShare Library
 * @version 2.0.0
 */

/**
 * Simple fixed percentage scheme with author taking remainder
 * @type {Object}
 */
export const AUTHOR_CENTRIC = {
  author: { percentage: 80 },
  platform: { percentage: 20 }
};

/**
 * Equal split between author and platform
 * @type {Object}
 */
export const EQUAL_SPLIT = {
  author: { percentage: 50 },
  platform: { percentage: 50 }
};

/**
 * Platform-friendly scheme
 * @type {Object}
 */
export const PLATFORM_FRIENDLY = {
  author: { percentage: 40 },
  platform: { percentage: 60 }
};

/**
 * Community focused with all buyers getting an equal share
 * @type {Object}
 */
export const COMMUNITY_EQUAL = {
  author: { percentage: 30 },
  platform: { percentage: 20 },
  allBuyers: { percentage: 50 }
};

/**
 * Early supporter scheme that rewards early buyers
 * @type {Object}
 */
export const EARLY_SUPPORTERS = {
  author: { percentage: 40 },
  platform: { percentage: 20 },
  first1000: { count: 1000, percentage: 30 },
  allBuyers: { percentage: 10 }
};

/**
 * Late supporter scheme that rewards late buyers
 * @type {Object}
 */
export const LATE_SUPPORTERS = {
  author: { percentage: 40 },
  platform: { percentage: 20 },
  last1000: { count: 1000, percentage: 30, fromEnd: true },
  allBuyers: { percentage: 10 }
};

/**
 * Minimal author scheme
 * @type {Object}
 */
export const MINIMAL_AUTHOR = {
  author: { percentage: 5 },
  platform: { percentage: 95 }
};

/**
 * Community growth with remainder
 * @type {Object}
 */
export const COMMUNITY_GROWTH = {
  author: { percentage: 30 },
  platform: { percentage: 20 },
  first500: { count: 500, percentage: 20 },
  allBuyers: { remainder: true }
};

/**
 * ----- Buy-to-Earn Predefined Models -----
 */

/**
 * Standard Buy-to-Earn model with balanced distribution
 * @type {Object}
 */
export const BUY_TO_EARN_STANDARD = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 10,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model with higher creator share
 * @type {Object}
 */
export const BUY_TO_EARN_CREATOR_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 20,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model with higher platform share
 * @type {Object}
 */
export const BUY_TO_EARN_PLATFORM_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 20,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 60
};

/**
 * Buy-to-Earn model optimized for faster early investor payback
 * @type {Object}
 */
export const BUY_TO_EARN_EARLY_PAYBACK = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 95 // Higher priority for non-payback tokens
};

/**
 * Buy-to-Earn model with more equal distribution rate
 * @type {Object}
 */
export const BUY_TO_EARN_EQUAL_DISTRIBUTION = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 25 // Low priority for non-payback tokens, more equal distribution
};

/**
 * Buy-to-Earn model with larger payback goal
 * @type {Object}
 */
export const BUY_TO_EARN_HIGH_PAYBACK = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 3, // Higher payback goal
  nonPaybackPoolSharePercent: 80
};

/**
 * Buy-to-Earn model focused on faster promotion
 * @type {Object}
 */
export const BUY_TO_EARN_PROMOTION_FOCUSED = {
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 25, // Higher promotion share
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 75
};
