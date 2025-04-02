# Revenue Sharing Library

A flexible JavaScript library for calculating revenue sharing payouts with various distribution schemes. Designed to handle complex revenue sharing scenarios for digital products, with support for different stakeholder groups and rule-based distribution.

## Features

- 🔄 **Flexible Schemes** - Support for various revenue sharing models with customizable rules
- 👥 **Group Targeting** - Allocate revenue to specific groups like early adopters or recent buyers
- 📊 **Detailed Reporting** - Get comprehensive breakdown of payments for all stakeholders
- 🔧 **Extensible Architecture** - Easily extend with custom calculators and validators
- 📦 **Predefined Schemes** - Ready-to-use schemes for common revenue sharing scenarios
- ✓ **Validation** - Built-in validation of revenue sharing schemes
- 💰 **Buy-to-Earn Model** - Support for investment phase and investor payback tracking

## Installation

```bash
npm install revenue-share-lib
```

or with yarn:

```bash
yarn add revenue-share-lib
```

## Quick Start

### Standard Revenue Sharing

```javascript
import { RevenueSharing, Schemes } from 'revenue-share-lib';

// Create a new instance with a predefined scheme
const revShare = new RevenueSharing({
  productName: 'My E-book',
  unitPrice: 29.99,
  scheme: Schemes.BasicSchemes.COMMUNITY_EQUAL
});

// Add sales
revShare.addSale({ buyer: 'user123' });
revShare.addSale({ buyer: 'user456' });
revShare.addSale({ buyer: 'user789' });

// Calculate payouts
const payouts = revShare.calculatePayouts();

console.log(payouts);
// Output:
// {
//   author: 29.99,
//   platform: 19.99,
//   buyers: {
//     user123: 16.66,
//     user456: 16.66,
//     user789: 16.66
//   }
// }
```

### Buy-to-Earn Model

```javascript
import RevShare from 'revenue-share-lib';

// Create a Buy-to-Earn model
const buyToEarn = RevShare.createBuyToEarn({
  productName: 'Premium Course',
  unitPrice: 300,
  initialInvestment: 300000,  // Initial investment amount
  creatorShare: 10,           // Creator gets 10% after investment phase
  platformShare: 10,          // Platform gets 10% after investment phase
  promotionShare: 10,         // 10% for marketing and promotion
  paybackRatio: 2,            // Buyers aim to get 2x their investment back
  nonPaybackPoolSharePercent: 60  // Prioritize tokens that haven't reached payback
});

// Add sales (including both investment phase and regular sales)
for (let i = 1; i <= 2000; i++) {
  buyToEarn.addSale({ buyer: `buyer${i}` });
}

// Calculate payouts for a specific token
const payouts = buyToEarn.calculatePayouts({
  specificTokenNumber: 50  // Calculate for token #50
});

console.log(`Token #50 has earned: ${payouts.buyer}`);
console.log(`Payback goal: ${payouts.paybackGoal}`);
console.log(`Payback achieved: ${payouts.paybackPoint ? `at sale #${payouts.paybackPoint}` : 'not yet'}`);
```

## Creating Custom Schemes

### Standard Schemes

You can create custom revenue sharing schemes to fit your specific needs:

```javascript
// Custom scheme where author gets 10%, platform gets 10%, 
// first 1000 buyers share 10%, and all buyers share the remainder
const customScheme = {
  author: { percentage: 10 },
  platform: { percentage: 10 },
  first1000: { count: 1000, percentage: 10 },
  allBuyers: { remainder: true }
};

const revShare = new RevenueSharing({
  productName: 'Premium Course',
  unitPrice: 99.99,
  scheme: customScheme
});
```

### Buy-to-Earn Schemes

You can create custom Buy-to-Earn schemes or use predefined ones:

```javascript
// Create a custom Buy-to-Earn scheme
const customBuyToEarnScheme = RevShare.createCustomBuyToEarnScheme({
  initialInvestment: 200000,
  creatorShare: 15,
  platformShare: 15,
  promotionShare: 5,
  paybackRatio: 1.8,
  nonPaybackPoolSharePercent: 70
});

// Use a custom scheme
const buyToEarn = RevShare.createBuyToEarn({
  productName: 'My Product',
  unitPrice: 250,
  ...customBuyToEarnScheme
});

// Or use a predefined scheme
const earlyPayback = RevShare.createFromBuyToEarnScheme(
  { 
    productName: 'Fast Payback Product', 
    unitPrice: 300 
  },
  'EARLY_PAYBACK'  // Use the EARLY_PAYBACK predefined scheme
);
```

## Scheme Structure

### Standard Revenue Sharing

A revenue sharing scheme is an object where:

- Keys represent stakeholders (author, platform) or buyer groups
- Values are objects defining distribution rules

#### Rule Properties

- `percentage`: Fixed percentage of revenue to allocate
- `count`: Number of buyers in the group (for targeted groups)
- `fromEnd`: Boolean indicating to count from the end (for last N buyers)
- `remainder`: Boolean indicating this group gets any unallocated revenue

#### Stakeholder Keys

- `author`: The creator of the product
- `platform`: The platform hosting the product
- `allBuyers`: All buyers of the product
- `firstN`: First N buyers (e.g., `first1000`)
- `lastN`: Last N buyers (e.g., `last500`)

### Buy-to-Earn Model

The Buy-to-Earn model uses the following parameters:

- `initialInvestment`: Amount of initial funding for the creator
- `unitPrice`: Price per token/unit
- `creatorShare`: Percentage for creator after investment phase
- `platformShare`: Percentage for platform
- `promotionShare`: Percentage for marketing and promotion
- `paybackRatio`: Multiplier determining payback goal (e.g., 2x means buyers aim to get twice their investment)
- `nonPaybackPoolSharePercent`: Percentage of buyers' pool allocated only to tokens that haven't reached payback goal

## Examples

### Basic Author/Platform Split

```javascript
const scheme = {
  author: { percentage: 70 },
  platform: { percentage: 30 }
};
```

### Community-Focused Model

```javascript
const scheme = {
  author: { percentage: 40 },
  platform: { percentage: 20 },
  allBuyers: { percentage: 40 }
};
```

### Early Adopter Rewards

```javascript
const scheme = {
  author: { percentage: 50 },
  platform: { percentage: 20 },
  first500: { count: 500, percentage: 30 }
};
```

### Buy-to-Earn with Early Investor Advantage

```javascript
// Create a Buy-to-Earn model that strongly prioritizes early investors
const earlyInvestorFocus = RevShare.createBuyToEarn({
  productName: 'Early Investor Focus',
  unitPrice: 500,
  initialInvestment: 300000,
  creatorShare: 10,
  platformShare: 10,
  promotionShare: 5,
  paybackRatio: 2,
  nonPaybackPoolSharePercent: 95  // 95% priority for non-paid-back tokens
});
```

## API Reference

### `RevenueSharing` Class

Main class for revenue sharing calculations.

```javascript
// Standard model
const revShare = new RevenueSharing({
  productName, // Name of the product
  unitPrice,   // Price per unit
  scheme,      // Revenue sharing scheme
  options      // Optional configuration
});

// Buy-to-Earn model
const buyToEarn = new RevenueSharing({
  productName,                  // Name of the product
  unitPrice,                    // Price per unit
  useBuyToEarnModel: true,      // Enable Buy-to-Earn model
  initialInvestment,            // Initial investment amount
  creatorShare,                 // Creator share percentage
  platformShare,                // Platform share percentage
  promotionShare,               // Promotion share percentage
  paybackRatio,                 // Payback goal multiplier
  nonPaybackPoolSharePercent,   // Non-payback pool percentage
  options                       // Optional configuration
});
```

#### Methods

- `addSale({ buyer, timestamp, metadata })`: Add a single sale
- `addSales(salesArray)`: Add multiple sales
- `calculatePayouts(options)`: Calculate payouts based on schemes and sales
  - For Buy-to-Earn model: `calculatePayouts({ specificTokenNumber })` to calculate for a specific token
- `calculateNumPrepayers()`: For Buy-to-Earn model, calculates number of prepayers needed for initial investment
- `estimateTokenPayback(tokenNumber)`: For Buy-to-Earn model, estimates payback point for a token
- `getSalesStats()`: Get statistics about sales
- `validateScheme()`: Validate the current scheme
- `exportData()`: Export all data for backup
- `importData(data)`: Import data from previous export

### Factory Methods

```javascript
// Create a standard model
const revShare = RevShare.create({
  productName: 'My Product',
  unitPrice: 100,
  scheme: myScheme
});

// Create a Buy-to-Earn model
const buyToEarn = RevShare.createBuyToEarn({
  productName: 'My Product',
  unitPrice: 300,
  initialInvestment: 300000,
  // other parameters...
});

// Create from a predefined Buy-to-Earn scheme
const buyToEarn = RevShare.createFromBuyToEarnScheme(
  {
    productName: 'My Product',
    unitPrice: 300
  },
  'STANDARD'  // Scheme name
);
```

### Predefined Schemes

The library includes several predefined schemes:

#### Standard Schemes (`Schemes.BasicSchemes` and `Schemes.AdvancedSchemes`)

- `AUTHOR_CENTRIC`: Author gets 80%, platform 20%
- `EQUAL_SPLIT`: 50-50 split between author and platform
- `COMMUNITY_EQUAL`: 30% author, 20% platform, 50% all buyers
- `EARLY_SUPPORTERS`: Extra allocation to first 1000 buyers
- `SLIDING_WINDOW`: Complex allocation with emphasis on recent buyers
- And many more...

#### Buy-to-Earn Schemes (`Schemes.BuyToEarnSchemes`)

- `STANDARD`: Balanced distribution with equal shares (10/10/10)
- `CREATOR_FOCUSED`: Higher creator share (20%)
- `EARLY_PAYBACK`: Optimized for faster early investor payback (95% priority)
- `EQUAL_DISTRIBUTION`: More equal distribution for all investors (25% priority)
- `HIGH_PAYBACK`: Higher payback goal (3x multiplier)
- And more...

## Advanced Topics

### Buy-to-Earn Dual Pool System

The Buy-to-Earn model uses a dual pool system for distributing buyers' share:

1. **Non-Payback Pool**: Allocated only to tokens that haven't reached their payback goal
2. **Shared Pool**: Distributed equally among all tokens

This creates an incentive structure where:
- Early investors reach their payback goal faster
- All tokens continue to receive revenue even after reaching payback
- The system adapts automatically as more tokens reach payback

### Estimating Token Payback

```javascript
// Estimate when a token will reach payback
const estimate = buyToEarn.estimateTokenPayback(1000);
console.log(`Token #1000 estimated to reach payback at sale #${estimate.paybackSale}`);
console.log(`Estimated ROI at payback: ${estimate.roi}%`);
```

## License

MIT
