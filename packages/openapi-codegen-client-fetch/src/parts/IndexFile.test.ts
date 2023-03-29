import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { createTestContext } from '../testHelpers';

import { IndexFile } from './IndexFile';

test('simple', () => {
  const openapi = OpenAPIFactory.create();
  const context = createTestContext(openapi);
  const utils = new IndexFile(context);

  utils.collectData();
  utils.generateCode();

  expect(context.project.getSourceFileOrThrow('src/index.ts').getText()).toMatchSnapshot(
    'src/index.ts',
  );
});
