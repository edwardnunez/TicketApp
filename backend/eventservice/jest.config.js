export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^axios$': '<rootDir>/__mocks__/axios.js'
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  // Configuraciones para evitar que Jest se cuelgue
  forceExit: true,
  detectOpenHandles: true,
  // Aumentar timeout para afterAll
  globalTeardown: undefined
};