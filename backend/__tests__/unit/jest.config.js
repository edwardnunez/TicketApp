/**
 * Configuración de Jest para tests unitarios
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/unit/**/*.test.js'
  ],
  collectCoverageFrom: [
    'utils/**/*.js',
    '!utils/**/*.test.js'
  ],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
