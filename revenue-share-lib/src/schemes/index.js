/**
 * @fileoverview Export all predefined revenue sharing schemes
 * @author RevShare Library
 * @version 2.0.0
 */

import * as BasicSchemes from './BasicSchemes';
import * as AdvancedSchemes from './AdvancedSchemes';
import * as BuyToEarnSchemes from './BuyToEarnSchemes';

// Export all schemes
export { BasicSchemes, AdvancedSchemes, BuyToEarnSchemes };

// Export a schemes catalog with metadata
export const SchemesCatalog = {
  basic: {
    name: 'Basic Schemes',
    description: 'Simple revenue sharing schemes for common use cases',
    schemes: {
      AUTHOR_CENTRIC: {
        title: 'Author Centric',
        description: 'Author gets 80%, platform gets 20%'
      },
      EQUAL_SPLIT: {
        title: 'Equal Split',
        description: 'Equal 50-50 split between author and platform'
      },
      PLATFORM_FRIENDLY: {
        title: 'Platform Friendly',
        description: 'Platform gets a larger share (60%) than the author (40%)'
      },
      COMMUNITY_EQUAL: {
        title: 'Community Equal',
        description: 'Community-focused with buyers getting 50% of revenue'
      },
      EARLY_SUPPORTERS: {
        title: 'Early Supporters',
        description: 'Rewards the first 1000 buyers with 30% of revenue'
      },
      LATE_SUPPORTERS: {
        title: 'Late Supporters',
        description: 'Rewards the last 1000 buyers with 30% of revenue'
      },
      MINIMAL_AUTHOR: {
        title: 'Minimal Author',
        description: 'Minimal share for the author (5%)'
      },
      COMMUNITY_GROWTH: {
        title: 'Community Growth',
        description: 'Rewards early buyers (20%) with remaining revenue going to all buyers'
      }
    }
  },
  advanced: {
    name: 'Advanced Schemes',
    description: 'More complex revenue sharing schemes for specific use cases',
    schemes: {
      SLIDING_WINDOW: {
        title: 'Sliding Window',
        description: 'Different allocations for different buyer groups with emphasis on late buyers'
      },
      EARLY_ADOPTER_TIERS: {
        title: 'Early Adopter Tiers',
        description: 'Multi-tier scheme that heavily rewards early buyers'
      },
      CREATOR_ECONOMY: {
        title: 'Creator Economy',
        description: 'Creator-focused scheme with 60% going to the author'
      },
      COMMUNITY_DRIVEN: {
        title: 'Community Driven',
        description: 'Most revenue goes back to the community of buyers (60%)'
      },
      ICO_MODEL: {
        title: 'ICO Model',
        description: 'Similar to token sales with tiered early adopter rewards'
      },
      CROWDFUNDING_MODEL: {
        title: 'Crowdfunding Model',
        description: 'Author gets 75% of revenue, similar to crowdfunding platforms'
      },
      DYNAMIC_TIERED: {
        title: 'Dynamic Tiered',
        description: 'Last buyers get a larger share (40%) than early buyers (10%)'
      },
      PLATFORM_GROWTH: {
        title: 'Platform Growth',
        description: 'Platform-focused scheme with 45% of revenue going to the platform'
      }
    }
  },
  buyToEarn: {
    name: 'Buy-to-Earn Schemes',
    description: 'Schemes for the Buy-to-Earn model with initial investment phase and dual-pool distribution',
    schemes: {
      STANDARD: {
        title: 'Standard Buy-to-Earn',
        description: 'Balanced distribution with equal shares between creator, platform and promotion'
      },
      CREATOR_FOCUSED: {
        title: 'Creator Focused',
        description: 'Prioritizes creator income with 20% share for the creator'
      },
      PLATFORM_FOCUSED: {
        title: 'Platform Focused',
        description: 'Prioritizes platform income with 20% share for the platform'
      },
      EARLY_PAYBACK: {
        title: 'Early Payback Priority',
        description: 'Optimized for faster early investor payback with 95% priority'
      },
      EQUAL_DISTRIBUTION: {
        title: 'Equal Distribution',
        description: 'More equal revenue distribution among all investors (25% priority)'
      },
      HIGH_PAYBACK: {
        title: 'High Payback Goal',
        description: 'Larger payback goal (3x) for investors with higher total returns'
      },
      PROMOTION_FOCUSED: {
        title: 'Promotion Focused',
        description: 'Higher allocation for marketing and promotional activities (25%)'
      },
      SMALL_INVESTMENT: {
        title: 'Small Initial Investment',
        description: 'Lower initial investment (100,000) for smaller projects'
      },
      LARGE_INVESTMENT: {
        title: 'Large Initial Investment',
        description: 'Higher initial investment (500,000) for larger projects'
      },
      QUICK_PAYBACK: {
        title: 'Quick Payback',
        description: 'Faster ROI for investors with 1.5x payback ratio'
      },
      BUYER_FOCUSED: {
        title: 'Buyer Focused',
        description: 'Maximizes buyer returns with lower platform/creator shares'
      }
    }
  }
};

// Export function to get a scheme by name
export function getSchemeByName(schemeName) {
  // Check basic schemes
  if (schemeName in BasicSchemes) {
    return BasicSchemes[schemeName];
  }
  
  // Check advanced schemes
  if (schemeName in AdvancedSchemes) {
    return AdvancedSchemes[schemeName];
  }
  
  // Check Buy-to-Earn schemes
  if (schemeName in BuyToEarnSchemes) {
    return BuyToEarnSchemes[schemeName];
  }
  
  // Scheme not found
  return null;
}

// Export function to get all schemes as an array
export function getAllSchemes() {
  return [
    ...Object.entries(BasicSchemes)
      .filter(([key]) => !key.startsWith('BUY_TO_EARN_')) // Filter out duplicated schemes
      .map(([key, scheme]) => ({
        id: key,
        scheme,
        category: 'basic',
        ...SchemesCatalog.basic.schemes[key]
      })),
    ...Object.entries(AdvancedSchemes).map(([key, scheme]) => ({
      id: key,
      scheme,
      category: 'advanced',
      ...SchemesCatalog.advanced.schemes[key]
    })),
    ...Object.entries(BuyToEarnSchemes)
      .filter(([key]) => key !== 'createCustomScheme' && key !== 'getSchemeByName' && 
              key !== 'getAllSchemeNames' && key !== 'getAllSchemesWithMetadata' && 
              key !== 'SCHEME_MAP')
      .map(([key, scheme]) => ({
        id: key,
        scheme,
        category: 'buyToEarn',
        ...SchemesCatalog.buyToEarn.schemes[key]
      }))
  ];
}

/**
 * Get Buy-to-Earn specific schemes only
 * @returns {Array<Object>} - Array of Buy-to-Earn schemes with metadata
 */
export function getBuyToEarnSchemes() {
  return Object.entries(BuyToEarnSchemes)
    .filter(([key]) => key !== 'createCustomScheme' && key !== 'getSchemeByName' && 
            key !== 'getAllSchemeNames' && key !== 'getAllSchemesWithMetadata' && 
            key !== 'SCHEME_MAP')
    .map(([key, scheme]) => ({
      id: key,
      scheme,
      category: 'buyToEarn',
      buyersShare: 100 - scheme.creatorShare - scheme.platformShare - scheme.promotionShare,
      paybackPoolSharePercent: 100 - scheme.nonPaybackPoolSharePercent,
      ...SchemesCatalog.buyToEarn.schemes[key]
    }));
}

/**
 * Creates a custom Buy-to-Earn scheme
 * @param {Object} params - Scheme parameters as defined in BuyToEarnSchemes.createCustomScheme
 * @returns {Object} - Custom Buy-to-Earn scheme
 */
export function createCustomBuyToEarnScheme(params) {
  return BuyToEarnSchemes.createCustomScheme(params);
}
