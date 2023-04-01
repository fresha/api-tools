import { titleCase } from '@fresha/api-tools-core';
import {
  addResourceAttributes,
  addResourceRelationship,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';

import { createGenerator } from '../testHelpers';

import { Resource } from './Resource';

import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

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

  expect(resource.sourceFile.getText()).toMatchSnapshot();
});

test('empty resource', () => {
  const resourceType = 'micro-nano';
  const { resource } = makeResource(resourceType);
  resource.collectData();
  resource.generateCode();

  expect(resource.sourceFile.getText()).toMatchSnapshot();
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

  expect(resource.sourceFile.getText()).toMatchSnapshot();
});
