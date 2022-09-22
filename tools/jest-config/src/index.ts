import path from 'path';

export default {
  clearMocks: true,
  coverageDirectory: '/tmp/coverage',
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  preset: 'ts-jest',
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: '/tmp/test-results', outputName: 'test-results.xml' }],
  ],
  setupFilesAfterEnv: [path.join(__dirname, 'setupEnv.js')],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testRunner: 'jest-circus/runner',
  transformIgnorePatterns: ['[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$'],
};
