import { titleCase } from '@fresha/api-tools-core';
import {
  addResourceAttributes,
  addResourceRelationship,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';

import { createGenerator } from '../testHelpers';

import { Resource } from './Resource';

import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import '@fresha/code-morph-test-utils/build/matchers';

const makeResource = (
  resourceType: string,
): { resource: Resource; resourceSchema: SchemaModel } => {
  const generator = createGenerator();

  const resourceName = titleCase(resourceType);

  const resourceSchema = generator.context.openapi.components.setSchema(resourceName);
  setResourceSchema(resourceSchema, resourceType);

  const resource = new Resource(
    generator.context,
    generator.context.project.getResourceModuleName(resourceType),
    generator.context.registry.addResourceSchema(resourceSchema),
  );

  return { resource, resourceSchema };
};

test('for schema-less resources, only link/1 is generated', () => {
  const resourceType = 'schema-less';
  const generator = createGenerator();
  const resource = new Resource(
    generator.context,
    generator.context.project.getResourceModuleName(resourceType),
    generator.context.registry.addResourceSchema(resourceType),
  );

  resource.collectData();
  resource.generateCode();

  expect(resource.sourceFile).toHaveFormattedElixirText(`
    defmodule ApiToolsWeb.SchemaLessResource do
      @moduledoc false

      @resource_type "schema-less"
      use Jabbax.Document

      def link(config) do
        %ResourceId{
          type: @resource_type,
          id: config.id,
        }
      end
    end
  `);
});

test('empty resource', () => {
  const resourceType = 'micro-nano';
  const { resource } = makeResource(resourceType);
  resource.collectData();
  resource.generateCode();

  expect(resource.sourceFile).toHaveFormattedElixirText(`
    defmodule ApiToolsWeb.MicroNanoResource do
      @moduledoc false

      @resource_type "micro-nano"
      use Jabbax.Document

      def build(config) do
        %Resource{
          type: @resource_type,
          id: config.id,
          attributes: %{
          },
        }
      end

      def link(config) do
        %ResourceId{
          type: @resource_type,
          id: config.id,
        }
      end
    end
  `);
});

test('happy path', () => {
  const generator = createGenerator();

  const resourceType = 'users';
  const resourceName = titleCase(resourceType);
  const resourceSchema = generator.context.openapi.components.setSchema(resourceName);

  // need to initialize resource schema before calling registry.parseResource
  setResourceSchema(resourceSchema, resourceType);
  addResourceAttributes(resourceSchema, {
    name: { type: 'string', required: true },
    age: 'integer',
    email: 'string',
  });
  addResourceRelationship(resourceSchema, 'organization', 'organizations');
  addResourceRelationship(resourceSchema, 'avatar', 'user-avatars');

  const resource = new Resource(
    generator.context,
    generator.context.project.getResourceModuleName(resourceType),
    generator.context.registry.addResourceSchema(resourceSchema),
  );

  resource.collectData();
  resource.generateCode();

  expect(resource.sourceFile).toHaveFormattedElixirText(`
    defmodule ApiToolsWeb.UsersResource do
      @moduledoc false

      @resource_type "users"
      use Jabbax.Document
      alias ApiToolsWeb.OrganizationsResource
      alias ApiToolsWeb.UserAvatarsResource

      def build(config) do
        %Resource{
          type: @resource_type,
          id: config.id,
          attributes: %{
            name: config.name,
            age: config.age,
            email: config.email,
          },
          relationships:
            %{}
            |> link_relationship(:organization, config.organization)
            |> link_relationship(:avatar, config.avatar)
        }
      end

      def link(config) do
        %ResourceId{
          type: @resource_type,
          id: config.id,
        }
      end

      defp link_relationship(relationships, type, nil) do
        Map.put(relationships, type, %Jabbax.Document.Relationship{data: nil})
      end

      defp link_relationship(relationships, :organization, organization) do
        Map.put(relationships, :organization, OrganizationsResource.link(organization))
      end

      defp link_relationship(relationships, :avatar, avatar) do
        Map.put(relationships, :avatar, UserAvatarsResource.link(avatar))
      end
    end
  `);
});
