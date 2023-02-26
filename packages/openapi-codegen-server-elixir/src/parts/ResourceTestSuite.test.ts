import { faker } from '@faker-js/faker';
import { addResourceAttributes, setResourceSchema } from '@fresha/openapi-codegen-utils';

import { createTestContext } from '../testHelpers';

import { ResourceTestSuite } from './ResourceTestSuite';

import '@fresha/openapi-codegen-test-utils/build/matchers';

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

  expect(generator.sourceFile).toHaveFormattedElixirText(`
    defmodule AwesomeWeb.TestResource do
      @moduledoc false

      use ExUnit.Case, async: false
      import AwesomeWeb.Factory
      alias AwesomeWeb.TestResource

      test "build/1" do
        config = build(
          :resource_tests,
          id: 884,
          num1: 11.75,
          num2: 11.6,
          int1: 16,
          int2: 10,
        )

        assert ResourceTestsResource.build(config) == %Jabbax.Document.Resource{
          type: "resource-tests",
          id: 884,
          attributes: %{
            num1: 11.75,
            num2: 11.6,
            int1: 16,
            int2: 10,
          },
          relationships: %{},
        }
      end

      test "link/1" do
        assert ResourceTestsResource.link(%{ id: 3525 }) == %Jabbax.Document.ResourceId{
          type: "resource-tests",
          id: 3525,
        }
      end
    end
  `);
});
