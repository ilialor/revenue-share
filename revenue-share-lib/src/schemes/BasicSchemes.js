/**
 * @fileoverview Basic revenue sharing schemes
 * @author RevShare Library
 * @version 1.0.0
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
