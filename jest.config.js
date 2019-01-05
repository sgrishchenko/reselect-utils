module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    snapshotSerializers: ['enzyme-to-json/serializer'],
    setupTestFrameworkScriptFile: "<rootDir>src/setupTests.ts"
};