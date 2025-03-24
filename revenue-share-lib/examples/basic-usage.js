/**
 * Basic usage examples for the Revenue Sharing Library
 */

// Import the library
const RevShare = require('../dist/revenue-share.js');

// Example 1: Simple Author/Platform Split
console.log('Example 1: Simple Author/Platform Split');
const simpleScheme = {
  author: { percentage: 100 }
};

const example1 = new RevShare.RevenueSharing({
  productName: 'Product1',
  unitPrice: 100,
  scheme: simpleScheme
});

example1.addSale({ buyer: 'buyer1' });
example1.addSale({ buyer: 'buyer2' });

const payouts1 = example1.calculatePayouts();
console.log(payouts1);
console.log('----------------------------------');

// Example 2: Fixed percentages with remainder to all buyers
console.log('Example 2: Fixed percentages with remainder to all buyers');
const schemeWithRemainder = {
  author: { percentage: 10 },
  platform: { percentage: 10 },
  allBuyers: { remainder: true }
};

const example2 = new RevShare.RevenueSharing({
  productName: 'Product1',
  unitPrice: 100,
  scheme: schemeWithRemainder
});

for (let i = 0; i < 10; i++) {
  example2.addSale({ buyer: `buyer${i}` });
}

const payouts2 = example2.calculatePayouts();
console.log(payouts2);
console.log('----------------------------------');

// Example 3: Early buyers bonus
console.log('Example 3: Early buyers bonus');
const earlyBuyerScheme = {
  author: { percentage: 10 },
  platform: { percentage: 10 },
  earlyBuyers: { count: 3, percentage: 10 },
  allBuyers: { remainder: true }
};

const example3 = new RevShare.RevenueSharing({
  productName: 'Product1',
  unitPrice: 100,
  scheme: earlyBuyerScheme
});

for (let i = 0; i < 5; i++) {
  example3.addSale({ buyer: `buyer${i}` });
}

const payouts3 = example3.calculatePayouts();
console.log(payouts3);
console.log('----------------------------------');

// Example 4: Sliding window scheme
console.log('Example 4: Sliding window scheme');
const slidingWindowScheme = {
  author: { percentage: 10 },
  platform: { percentage: 7 },
  first500: { count: 2, percentage: 5 },
  last5000: { count: 3, percentage: 70, fromEnd: true },
  allBuyers: { percentage: 8 }
};

const example4 = new RevShare.RevenueSharing({
  productName: 'Product1',
  unitPrice: 100,
  scheme: slidingWindowScheme
});

for (let i = 0; i < 10; i++) {
  example4.addSale({ buyer: `buyer${i}` });
}

const payouts4 = example4.calculatePayouts();
console.log(payouts4);
console.log('----------------------------------');

// Example 5: Using predefined schemes
console.log('Example 5: Using predefined schemes');
const example5 = new RevShare.RevenueSharing({
  productName: 'Premium Course',
  unitPrice: 199.99,
  scheme: RevShare.Schemes.BasicSchemes.COMMUNITY_EQUAL
});

for (let i = 0; i < 5; i++) {
  example5.addSale({ buyer: `student${i}` });
}

const payouts5 = example5.calculatePayouts();
console.log(payouts5);
console.log('----------------------------------');

// Example 6: Getting sales statistics
console.log('Example 6: Sales statistics');
const stats5 = example5.getSalesStats();
console.log(stats5);
console.log('----------------------------------');

// Example 7: Scheme validation
console.log('Example 7: Scheme validation');
const validationResult = RevShare.validateScheme({
  author: { percentage: 110 },
  platform: { percentage: 20 }
});
console.log(validationResult);
console.log('----------------------------------');

// Example 8: Listing all available schemes
console.log('Example 8: Available schemes');
const allSchemes = RevShare.getAllSchemes();
console.log(`Total predefined schemes: ${allSchemes.length}`);
allSchemes.forEach(scheme => {
  console.log(`- ${scheme.title}: ${scheme.description}`);
});
