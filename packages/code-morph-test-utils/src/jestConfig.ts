import path from 'path';

import baseConfig from '@fresha/jest-config/build/index';

export default {
  ...baseConfig,
  setupFilesAfterEnv: [path.join(__dirname, 'setupEnv.js')],
};
