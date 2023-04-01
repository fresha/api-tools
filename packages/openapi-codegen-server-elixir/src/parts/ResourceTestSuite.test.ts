import { faker } from '@faker-js/faker';
import { addResourceAttributes, setResourceSchema } from '@fresha/openapi-codegen-utils';

import { createTestContext } from '../testHelpers';

import { ResourceTestSuite } from './ResourceTestSuite';

test('simple resource', () => {
  const context = createTestContext('awesome_web');

  const schema = context.openapi.components.setSchema('TestResource');
  setResourceSchema(schema, 'resource-tests');
  addResourceAttributes(schema, {
    num1: {
      type: 'number',
      minimum: 10,
      exclusiveMinimum: true,
      maximum: 20,
      exclusiveMaximum: true,
    },
    num2: { type: 'number', minimum: 10, maximum: 20 },
    int1: {
      type: 'integer',
      minimum: 10,
      exclusiveMinimum: true,
      maximum: 20,
      exclusiveMaximum: true,
    },
    int2: { type: 'integer', minimum: 10, maximum: 20 },
  });

  const resourceSchema = context.registry.addResourceSchema(schema);

  faker.seed(38459284924);

  const generator = new ResourceTestSuite(
    context,
    'AwesomeWeb.TestResource',
    'AwesomeWeb.TestResource',
    resourceSchema,
  );
  generator.collectData();
  generator.generateCode();

  expect(generator.sourceFile.getText()).toMatchSnapshot();
});
