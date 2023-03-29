import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3/model/OpenAPI';

import { createTestContext } from '../testHelpers';

import { UtilsFile } from './UtilsFile';

test('simple', () => {
  const openapi = OpenAPIFactory.create();
  const context = createTestContext(openapi);

  const utils = new UtilsFile(context);
  utils.collectData();
  utils.generateCode();

  expect(context.project.getSourceFileOrThrow('src/utils.ts').getText()).toMatchSnapshot(
    'src/utils.ts',
  );
});
