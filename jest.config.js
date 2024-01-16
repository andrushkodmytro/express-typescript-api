/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  collectCoverageFrom: ['!**/node_modules/**'],
  verbose: true,
  forceExit: true,
  testTimeout: 20000
}
