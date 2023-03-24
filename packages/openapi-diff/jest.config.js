const baseConfig = require('@fresha/jest-config').default;

const { coverageThreshold, ...otherConfig } = baseConfig;

module.exports = {
  ...otherConfig,
  coverageThreshold: {
    ...coverageThreshold,
    './src/**/*.ts': {
      branches: 80,
      functions: 40,
      lines: 40,
    },
  },
};
