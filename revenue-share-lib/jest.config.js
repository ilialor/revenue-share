/**
 * Jest configuration file for the Revenue Sharing Library
 */

module.exports = {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The root directory that Jest should scan for tests
  roots: ['<rootDir>/tests'],
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json'],
  
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Collect coverage information from all files
  collectCoverage: true,
  
  // The paths to include for coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**'
  ],
  
  // The threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Transform files with babel-jest
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Setup для ES модулей
  transformIgnorePatterns: [
    '/node_modules/(?!.*\\.mjs$)'
  ],
  
  // Используем тип модулей ESM
  extensionsToTreatAsEsm: ['.js'],
  
  // Добавляем эти настройки для поддержки ESM в Jest
  globals: {
    'ts-jest': {
      useESM: true,
    },
  }
};
