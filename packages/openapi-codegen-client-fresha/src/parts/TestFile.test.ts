import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { Generator } from './Generator';
import { TestFile } from './TestFile';

import '@fresha/jest-config';

const makeTestFile = (openapi: OpenAPIModel): TestFile => {
  const logger = createLogger(false);
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const tsSourceFile = tsProject.createSourceFile('index.ts', '');

  const testFile = new TestFile({
    options: {
      outputPath: '/',
      useJsonApi: true,
    },
    apiName: 'testApi',
    apiRootUrl: 'TEST_FILE_URL',
    openapi,
    logger,
    tsProject,
    tsSourceFile,
  } as Generator);

  return testFile;
};

test('happy path', () => {
  const openapi = OpenAPIFactory.create();
  const testFile = makeTestFile(openapi);

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
