export default {
  testEnvironment: 'jsdom',

  // Transform ESM modules
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Collect coverage from
  collectCoverageFrom: [
    'dom-utilities/All.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],

  // Test match pattern
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],

  // jsdom does not ship EventSource. live-sync.js auto-starts at import
  // time and instantiates EventSource, so stub it before any module loads.
  setupFiles: ['./jest.setup.js'],

  // Verbose output
  verbose: true
};
