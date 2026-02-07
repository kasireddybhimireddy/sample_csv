module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^chart.js$': '<rootDir>/src/__mocks__/chart.js',
    '^chartjs-adapter-date-fns$': '<rootDir>/src/__mocks__/chartjs-adapter-date-fns.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chart.js|chartjs-adapter-date-fns|react-chartjs-2)/)',
  ],
  testTimeout: 10000,
};
