# Revenue Sharing Library

A flexible JavaScript library for calculating revenue sharing payouts with various distribution schemes. Designed to handle complex revenue sharing scenarios for digital products, with support for different stakeholder groups and rule-based distribution.

## Features

- 🔄 **Flexible Schemes** - Support for various revenue sharing models with customizable rules
- 👥 **Group Targeting** - Allocate revenue to specific groups like early adopters or recent buyers
- 📊 **Detailed Reporting** - Get comprehensive breakdown of payments for all stakeholders
- 🔧 **Extensible Architecture** - Easily extend with custom calculators and validators
- 📦 **Predefined Schemes** - Ready-to-use schemes for common revenue sharing scenarios
- ✓ **Validation** - Built-in validation of revenue sharing schemes

## Installation

```bash
npm install revenue-share-lib
```

or with yarn:

```bash
yarn add revenue-share-lib
```

## Quick Start

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

## Creating Custom Schemes

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

## Scheme Structure

A revenue sharing scheme is an object where:

- Keys represent stakeholders (author, platform) or buyer groups
- Values are objects defining distribution rules

### Rule Properties

- `percentage`: Fixed percentage of revenue to allocate
- `count`: Number of buyers in the group (for targeted groups)
- `fromEnd`: Boolean indicating to count from the end (for last N buyers)
- `remainder`: Boolean indicating this group gets any unallocated revenue

### Stakeholder Keys

- `author`: The creator of the product
- `platform`: The platform hosting the product
- `allBuyers`: All buyers of the product
- `firstN`: First N buyers (e.g., `first1000`)
- `lastN`: Last N buyers (e.g., `last500`)

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

### Tiered Distribution

```javascript
const scheme = {
  author: { percentage: 30 },
  platform: { percentage: 20 },
  first100: { count: 100, percentage: 25 },
  first1000: { count: 1000, percentage: 15 },
  allBuyers: { percentage: 10 }
};
```

## API Reference

### `RevenueSharing` Class

Main class for revenue sharing calculations.

```javascript
const revShare = new RevenueSharing({
  productName, // Name of the product
  unitPrice,   // Price per unit
  scheme,      // Revenue sharing scheme
  options      // Optional configuration
});
```

#### Methods

- `addSale({ buyer, timestamp, metadata })`: Add a single sale
- `addSales(salesArray)`: Add multiple sales
- `calculatePayouts(options)`: Calculate payouts based on schemes and sales
- `getSalesStats()`: Get statistics about sales
- `validateScheme()`: Validate the current scheme
- `exportData()`: Export all data for backup
- `importData(data)`: Import data from previous export

### Predefined Schemes

The library includes several predefined schemes in `Schemes.BasicSchemes` and `Schemes.AdvancedSchemes`:

- `AUTHOR_CENTRIC`: Author gets 80%, platform 20%
- `EQUAL_SPLIT`: 50-50 split between author and platform
- `COMMUNITY_EQUAL`: 30% author, 20% platform, 50% all buyers
- `EARLY_SUPPORTERS`: Extra allocation to first 1000 buyers
- `SLIDING_WINDOW`: Complex allocation with emphasis on recent buyers
- And many more...

## License

MIT
