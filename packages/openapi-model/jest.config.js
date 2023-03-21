const baseConfig = require('@fresha/jest-config').default;

const { coverageThreshold, ...otherConfig } = baseConfig;

module.exports = {
  ...otherConfig,
  coverageThreshold: {
    ...coverageThreshold,
    './src/3.0.3/**/*.ts': {
      branches: 60,
      functions: 60,
      lines: 60,
    },
  },
};
