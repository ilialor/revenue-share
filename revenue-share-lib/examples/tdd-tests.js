/**
 * @fileoverview Test file for TDD approach with RevenueSharing library
 * This file imports the library in a real environment and verifies expected responses
 * for various test cases
 */

// Import the library
const RevShare = require('../dist/revenue-share.js');
const { RevenueSharing } = RevShare;

// Utility function to assert equality
function assertEqual(actual, expected, testName) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) {
    console.log(`✅ PASSED: ${testName}`);
    return true;
  } else {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual:   ${JSON.stringify(actual)}`);
    return false;
  }
}

// Utility function to assert approximate equality
function assertClose(actual, expected, testName, precision = 2) {
  const roundedActual = Math.round(actual * Math.pow(10, precision)) / Math.pow(10, precision);
  const roundedExpected = Math.round(expected * Math.pow(10, precision)) / Math.pow(10, precision);
  
  if (roundedActual === roundedExpected) {
    console.log(`✅ PASSED: ${testName}`);
    return true;
  } else {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`  Expected ~${expected} (${roundedExpected})`);
    console.log(`  Actual   ~${actual} (${roundedActual})`);
    return false;
  }
}

// Utility function to assert that every value in an object meets a condition
function assertEvery(object, condition, testName) {
  const result = Object.values(object).every(condition);
  if (result) {
    console.log(`✅ PASSED: ${testName}`);
    return true;
  } else {
    console.log(`❌ FAILED: ${testName}`);
    console.log(`  Not all values match condition in:`, object);
    return false;
  }
}

console.log('Running TDD tests for RevenueSharing library...');
console.log('------------------------------------------------');

// Test 1: Simple scheme (author receives 100%)
console.log('\nTest 1: Author receives 100% of revenue');
try {
  const scheme = { author: { percentage: 100 } };
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme
  });
  
  lib.addSale({ buyer: 'buyer1' });
  lib.addSale({ buyer: 'buyer2' });
  
  const payouts = lib.calculatePayouts();
  
  assertEqual(payouts.author, 200, 'Author should receive 200');
  assertEqual(payouts.platform, 0, 'Platform should receive 0');
  assertEvery(payouts.buyers, val => val === 0, 'All buyers should receive 0');
} catch (error) {
  console.log(`❌ FAILED: Test 1 threw an error: ${error.message}`);
}

// Test 2: Fixed percentages with remainder to all buyers
console.log('\nTest 2: Fixed percentages with remainder to all buyers');
try {
  const scheme = {
    author: { percentage: 10 },
    platform: { percentage: 10 },
    allBuyers: { remainder: true }
  };
  
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme
  });
  
  for (let i = 0; i < 10; i++) {
    lib.addSale({ buyer: `buyer${i}` });
  }
  
  const payouts = lib.calculatePayouts();
  
  assertEqual(payouts.author, 100, 'Author should receive 100');
  assertEqual(payouts.platform, 100, 'Platform should receive 100');
  assertEvery(payouts.buyers, val => val === 80, 'All buyers should receive 80');
} catch (error) {
  console.log(`❌ FAILED: Test 2 threw an error: ${error.message}`);
}

// Test 3: Early buyers bonus
console.log('\nTest 3: Early buyers bonus');
try {
  const scheme = {
    author: { percentage: 10 },
    platform: { percentage: 10 },
    earlyBuyers: { count: 3, percentage: 10 },
    allBuyers: { remainder: true }
  };
  
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme
  });
  
  for (let i = 0; i < 5; i++) {
    lib.addSale({ buyer: `buyer${i}` });
  }
  
  const payouts = lib.calculatePayouts();
  
  assertEqual(payouts.author, 50, 'Author should receive 50');
  assertEqual(payouts.platform, 50, 'Platform should receive 50');
  assertClose(payouts.buyers['buyer0'], 16.67 + 70, 'First buyer should receive ~86.67');
  assertClose(payouts.buyers['buyer3'], 70, 'Fourth buyer should receive ~70');
} catch (error) {
  console.log(`❌ FAILED: Test 3 threw an error: ${error.message}`);
}

// Test 4: Sliding window scheme
console.log('\nTest 4: Sliding window scheme');
try {
  const scheme = {
    author: { percentage: 10 },
    platform: { percentage: 7 },
    first500: { count: 2, percentage: 5 },
    last5000: { count: 3, percentage: 70, fromEnd: true },
    allBuyers: { percentage: 8 }
  };
  
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme
  });
  
  for (let i = 0; i < 10; i++) {
    lib.addSale({ buyer: `buyer${i}` });
  }
  
  const payouts = lib.calculatePayouts();
  
  assertEqual(payouts.author, 100, 'Author should receive 100');
  assertEqual(payouts.platform, 70, 'Platform should receive 70');
  assertClose(payouts.buyers['buyer0'], 25 + 8, 'First buyer should receive ~33');
  assertClose(payouts.buyers['buyer9'], 233.33 + 8, 'Last buyer should receive ~241.33');
  assertEqual(payouts.buyers['buyer4'], 8, 'Middle buyer should receive 8');
} catch (error) {
  console.log(`❌ FAILED: Test 4 threw an error: ${error.message}`);
}

// Test 5: Zero sales
console.log('\nTest 5: Zero sales');
try {
  const scheme = { 
    author: { percentage: 10 }, 
    allBuyers: { remainder: true } 
  };
  
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme
  });
  
  const payouts = lib.calculatePayouts();
  
  assertEqual(payouts.author, 0, 'Author should receive 0');
  assertEqual(payouts.platform, 0, 'Platform should receive 0');
  assertEqual(Object.keys(payouts.buyers).length, 0, 'No buyers should be in the payouts');
} catch (error) {
  console.log(`❌ FAILED: Test 5 threw an error: ${error.message}`);
}

// Test 6: Scheme validation
console.log('\nTest 6: Scheme validation');
try {
  const scheme = {
    author: { percentage: 60 },
    platform: { percentage: 50 }
  };
  
  // console.log('Тестовая схема:', JSON.stringify(scheme, null, 2));
  
  // Создаем экземпляр без проверки схемы
  const lib = new RevenueSharing({
    productName: 'Product1',
    unitPrice: 100,
    scheme: scheme,
    options: { validateScheme: false } // Отключаем валидацию при создании
  });
  
  // Выполняем ручную проверку схемы
  const validationResult = lib.validateScheme();
  
  // console.log('Результат валидации:', JSON.stringify(validationResult, null, 2));
  
  // Проверяем, что есть хотя бы одно предупреждение о превышении 100%
  const hasPercentageWarning = validationResult.warnings.some(
    warning => warning.includes("Total percentage allocation") && warning.includes("doesn't equal 100%")
  );
  
  if (hasPercentageWarning) {
    console.log(`✅ PASSED: Validation correctly generated warning about excessive percentage allocation`);
  } else {
    console.log('❌ FAILED: Scheme validation should have warned about excessive percentage allocation');
  }
} catch (error) {
  console.log(`❌ FAILED: Test 6 threw an unexpected error: ${error.message}`);
}

console.log('\n------------------------------------------------');
console.log('TDD tests completed!');
