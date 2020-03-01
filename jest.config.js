module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/packages/*/src/**/*.{ts,tsx}',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/[^\\/]+/src/__data__/',
    '<rootDir>/packages/[^\\/]+/src/__stories__/',
  ],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/.docz/'],
};
