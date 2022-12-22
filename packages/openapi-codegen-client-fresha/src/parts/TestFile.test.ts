import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { makeContext } from '../testUtils';

import { TestFile } from './TestFile';

import '@fresha/jest-config';

const makeTestFile = (): TestFile => {
  const openapi = OpenAPIFactory.create();
  openapi.paths.setExtension('root-url', 'TEST_FILE_URL');
  const context = makeContext(openapi);

  return new TestFile(context);
};

test('happy path', () => {
  const testFile = makeTestFile();

  testFile.collectData();
  testFile.generateCode();

  expect(testFile.tsSourceFile).toHaveFormattedText(`
    import type { APIEntryConfig } from '@fresha/connector-utils/build/types/api';
    import { generateUrlsMapping } from '@fresha/connector-utils/build/apiConfig/utils';
    import { makeApiConfig } from './index';

    const TEST_FILE_URL = 'http://localhost:3000';

    describe('init', () => {
      it('matches the snapshot', () => {
        const [apiConfig, options] = makeApiConfig({ TEST_FILE_URL });
        expect(
          generateUrlsMapping([(apiConfig as unknown) as APIEntryConfig[], options]),
        ).toMatchSnapshot();
      });
    });
  `);
});
