import {
  addResourceRelationship,
  MEDIA_TYPE_JSON_API,
  RelationshipCardinality,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';

import { createTestContext } from '../testHelpers';

import { Controller } from './Controller';

import '@fresha/code-morph-test-utils/build/matchers';

test('parameter-less action, minimal implementation', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.addOperation('post');
  operation.operationId = 'createEmployee';

  const controller = new Controller(context, '/pracownicy', 'AwesoneWeb.EmployeesController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile).toHaveFormattedElixirText(`
    defmodule AwesoneWeb.EmployeesController do
      @moduledoc false

      use AwesomeWeb, :controller

      action_fallback(AwesomeWeb.FallbackController)

      # add aliases here

      def create(conn, _params) do
        # TODO this is the part you need to implement by yourself
        # TODO evaluate extra arguments, then pass them to render()
        render(conn)
      end
    end
  `);
});

test('ID parameter leads to generating parse_XXXX_param function, as well as error handling', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.addOperation('get');
  operation.operationId = 'readEmployee';
  operation.addParameter('id', 'path').setSchema('string');

  const controller = new Controller(context, 'employees', 'EmployeeController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile).toHaveFormattedElixirText(`
    defmodule EmployeeController do
      @moduledoc false

      use AwesomeWeb, :controller

      action_fallback(AwesomeWeb.FallbackController)

      # add aliases here

      def show(conn, params) do
        with {:ok, id} <- parse_show_params(params) do
          # TODO this is the part you need to implement by yourself
          # TODO evaluate extra arguments, then pass them to render()
          render(conn)
        else
          {:error, :invalid_parameters, params} ->
            {:error, :invalid_parameters, params}

          {:error, :invalid_pointers, pointers} ->
            {:error, :invalid_parameters, pointers}

          {:error, :not_found} ->
            {:error, :not_found}
        end
      end

      defp parse_show_params(params) do
        flat_parse(
          params,
          id: [:id, :required],
        )
      end
    end
  `);
});

test('request body leads to generating parse_XXXX_conn function, as well as error handling', () => {
  const context = createTestContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/profile');
  const requestBodySchema = pathItem
    .addOperation('put')
    .setRequestBody()
    .setMediaType(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'profile-settings');
  const attributesSchema = requestBodySchema
    .getPropertyOrThrow('data')
    .getPropertyDeepOrThrow('attributes');
  attributesSchema.setProperties({
    name: { type: 'string', required: true },
    age: { type: 'integer', required: true, minimum: 18, maximum: 200 },
    weight: 'float',
    birthDate: 'date',
    score: 'number',
    gender: { type: 'string', required: true, enum: ['male', 'female', 'other'] },
    num1: { type: 'number', minimum: 10, exclusiveMinimum: true },
    num2: { type: 'number', minimum: 10, exclusiveMinimum: false },
    num3: { type: 'number', maximum: 20, exclusiveMaximum: true },
    num4: { type: 'number', maximum: 20, exclusiveMaximum: false },
    int1: { type: 'integer', minimum: 10, exclusiveMinimum: true },
    int2: { type: 'integer', minimum: 10, exclusiveMinimum: false },
    int3: { type: 'integer', maximum: 20, exclusiveMaximum: true },
    int4: { type: 'integer', maximum: 20, exclusiveMaximum: false },
  });

  const resourceSchema = requestBodySchema.getPropertyOrThrow('data');
  addResourceRelationship(resourceSchema, 'location', 'locations');
  addResourceRelationship(
    resourceSchema,
    'employee',
    'employees',
    RelationshipCardinality.One,
    false,
  );

  const controller = new Controller(context, '/profile', 'AwesomeWeb.ProfileController');
  controller.collectData(pathItem);
  controller.generateCode();

  // TODO test
  // :decimal
  // :email
  // trim options for :string
  expect(controller.sourceFile).toHaveFormattedElixirText(`
    defmodule AwesomeWeb.ProfileController do
      @moduledoc false

      use AwesomeWeb, :controller

      action_fallback(AwesomeWeb.FallbackController)

      # add aliases here

      def update(conn, _params) do
        with {:ok, parsed_opts} <- parse_update_conn(conn) do
          # TODO this is the part you need to implement by yourself
          # TODO evaluate extra arguments, then pass them to render()
          render(conn)
        else
          {:error, :invalid_parameters, params} ->
            {:error, :invalid_parameters, params}

          {:error, :invalid_pointers, pointers} ->
            {:error, :invalid_parameters, pointers}

          {:error, :not_found} ->
            {:error, :not_found}
        end
      end

      defp parse_update_conn(conn) do
        parse(
          conn.assigns[:doc],
          id: [:id, :required],
          attributes: %{
            name: [:string, :required],
            age: [{:integer, min: 18, max: 200}, :required],
            weight: :float,
            birth_date: :date,
            score: :float,
            gender: [:string, :required, {:contain, ~w{male female other}}],
            num1: {:float, min: 10},
            num2: {:float, min: 10},
            num3: {:float, max: 20},
            num4: {:float, max: 20},
            int1: {:integer, min: 11},
            int2: {:integer, min: 10},
            int3: {:integer, max: 19},
            int4: {:integer, max: 20},
          },
          relationships: %{
            location: [:resource_id, :required],
            employee: :resource_id,
          },
        )
      end
    end
  `);
});
