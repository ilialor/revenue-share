/**
 * @fileoverview Export all predefined revenue sharing schemes
 * @author RevShare Library
 * @version 1.0.0
 */

import * as BasicSchemes from './BasicSchemes';
import * as AdvancedSchemes from './AdvancedSchemes';

// Export all schemes
export { BasicSchemes, AdvancedSchemes };

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
  
  // Scheme not found
  return null;
}

// Export function to get all schemes as an array
export function getAllSchemes() {
  return [
    ...Object.entries(BasicSchemes).map(([key, scheme]) => ({
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
    }))
  ];
}
