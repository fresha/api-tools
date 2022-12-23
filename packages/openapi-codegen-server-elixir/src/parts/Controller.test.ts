import { poorMansElixirFormat } from '@fresha/ex-morph';
import {
  addResourceRelationship,
  MEDIA_TYPE_JSON_API,
  setDataDocumentSchema,
} from '@fresha/openapi-codegen-utils';
import { SchemaFactory } from '@fresha/openapi-model/build/3.0.3';

import { makeContext } from '../testHelpers';

import { Controller } from './Controller';

test('parameter-less action, minimal implementation', () => {
  const context = makeContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.setOperation('post');
  operation.operationId = 'createEmployee';

  const controller = new Controller(context, '/pracownicy', 'AwesoneWeb.EmployeesController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile.getText()).toBe(
    poorMansElixirFormat(`
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
  `),
  );
});

test('ID parameter leads to generating parse_XXXX_param function, as well as error handling', () => {
  const context = makeContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/employees/:id/tasks');
  const operation = pathItem.setOperation('get');
  operation.operationId = 'readEmployee';
  const idParam = operation.addParameter('id', 'path');
  idParam.schema = SchemaFactory.create(idParam, 'string');

  const controller = new Controller(context, 'employees', 'EmployeeController');
  controller.collectData(pathItem);
  controller.generateCode();

  expect(controller.sourceFile.getText()).toBe(
    poorMansElixirFormat(`
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
  `),
  );
});

test('request body leads to generating parse_XXXX_conn function, as well as error handling', () => {
  const context = makeContext('awesome_web');

  const pathItem = context.openapi.setPathItem('/profile');
  const requestBodySchema = pathItem
    .setOperation('put')
    .setRequestBody()
    .setContent(MEDIA_TYPE_JSON_API)
    .setSchema('object');
  setDataDocumentSchema(requestBodySchema, 'profile-settings');
  const attributesSchema = requestBodySchema
    .getPropertyOrThrow('data')
    .getPropertyOrThrow('attributes');
  attributesSchema.setProperties({
    name: { type: 'string', required: true },
    age: { type: 'integer', required: true, minimum: 18, maximum: 200 },
    weight: 'float',
    birthDate: 'date',
    score: 'number',
    gender: { type: 'string', required: true, enum: ['male', 'female', 'other'] },
  });

  const resourceSchema = requestBodySchema.getPropertyOrThrow('data');
  addResourceRelationship(resourceSchema, 'location', { type: 'locations', required: true });
  addResourceRelationship(resourceSchema, 'employee', { type: 'employees', required: false });

  const controller = new Controller(context, '/profile', 'AwesomeWeb.ProfileController');
  controller.collectData(pathItem);
  controller.generateCode();

  // TODO test
  // :decimal
  // :email
  // trim options for :string
  expect(controller.sourceFile.getText()).toBe(
    poorMansElixirFormat(`
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
            },
            relationships: %{
              location: [:resource_id, :required],
              employee: :resource_id,
            },
          )
        end
      end
    `),
  );
});
