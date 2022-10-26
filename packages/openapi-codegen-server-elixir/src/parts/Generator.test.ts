import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { Generator } from './Generator';

const logger = createLogger(false);

test('happy path', () => {
  const openapi = OpenAPIFactory.create();

  const generator = new Generator(openapi, {}, logger);

  generator.collectData();
  generator.generateCode();
});
