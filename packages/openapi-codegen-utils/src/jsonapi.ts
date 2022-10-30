import assert from 'assert';

import {
  SchemaCreateOptions,
  SchemaFactory,
  SchemaModel,
  SchemaModelParent,
} from '@fresha/openapi-model/build/3.0.3';

export const setResourceIdSchema = (linkSchema: SchemaModel, type?: string): void => {
  assert(linkSchema.type === 'object');
  linkSchema.setProperties({
    type: { type: 'string', required: true, minLength: 1, enum: type ? [type] : undefined },
    id: { type: 'string', required: true, minLength: 1 },
  });
};

export const createResourceIdSchema = (parent: SchemaModelParent, type?: string): SchemaModel => {
  const linkSchema = SchemaFactory.create(parent, 'object');
  setResourceIdSchema(linkSchema, type);
  return linkSchema;
};

export const setResourceSchema = (resourceSchema: SchemaModel, resourceType: string): void => {
  assert(resourceSchema.type === 'object');
  resourceSchema.setProperties({
    type: {
      type: 'string',
      required: true,
      minLength: 1,
      enum: resourceType ? [resourceType] : undefined,
    },
    id: { type: 'string', required: true, minLength: 1 },
    attributes: { type: 'object', required: true },
    relationships: 'object',
  });
};

export const createResourceSchema = (parent: SchemaModelParent, type: string): SchemaModel => {
  const resourceSchema = SchemaFactory.create(parent, 'object');
  setResourceSchema(resourceSchema, type);
  return resourceSchema;
};

export const addResourceAttribute = (
  resourceSchema: SchemaModel,
  name: string,
  options: SchemaCreateOptions,
): SchemaModel => {
  assert(resourceSchema.type === 'object');
  const attributesSchema = resourceSchema.getPropertyOrThrow('attributes');
  assert(attributesSchema.type === 'object');
  return attributesSchema.setProperty(name, options);
};

export const addResourceAttributes = (
  resourceSchema: SchemaModel,
  attrs: Record<string, SchemaCreateOptions>,
): void => {
  for (const [attrName, attrOptions] of Object.entries(attrs)) {
    addResourceAttribute(resourceSchema, attrName, attrOptions);
  }
};

export type RelationshipCreateOptions =
  | string
  | {
      type: string;
      required?: boolean;
      multiple?: boolean;
    };

export const addResourceRelationship = (
  resourceSchema: SchemaModel,
  name: string,
  options: RelationshipCreateOptions,
): void => {
  let relationshipsSchema = resourceSchema.getProperty('relationships');
  if (!relationshipsSchema) {
    relationshipsSchema = resourceSchema.setProperty('relationships', 'object');
  }
  assert(relationshipsSchema.type === 'object');

  if (typeof options === 'string') {
    const dataSchema = relationshipsSchema
      .setProperty(name, { type: 'object', required: false })
      .setProperty('data', { type: 'object', required: true });
    dataSchema.nullable = true;
    setResourceIdSchema(dataSchema, options);
  } else if (options.multiple) {
    const dataSchema = relationshipsSchema
      .setProperty(name, { type: 'object', required: !!options.required })
      .setProperty('data', { type: 'array', required: true });
    dataSchema.items = createResourceIdSchema(dataSchema, options.type);
  } else {
    const dataSchema = relationshipsSchema
      .setProperty(name, { type: 'object', required: !!options.required })
      .setProperty('data', { type: 'object', required: true });
    setResourceIdSchema(dataSchema, options.type);
  }
};

type PrimaryDataOptions =
  | string
  | {
      type: string;
      multiple?: string;
    };

export const setDataDocumentSchema = (
  documentSchema: SchemaModel,
  dataOptions: PrimaryDataOptions,
): void => {
  assert(documentSchema.type === 'object');

  documentSchema
    .setProperty('jsonapi', 'object')
    .setProperty('version', { type: 'string', required: true, enum: ['1.0'] });

  if (typeof dataOptions === 'string') {
    setResourceSchema(
      documentSchema.setProperty('data', { type: 'object', required: true }),
      dataOptions,
    );
  } else if (dataOptions.multiple) {
    const dataSchema = documentSchema.setProperty('data', { type: 'array', required: true });
    dataSchema.items = createResourceSchema(dataSchema, dataOptions.type);
  } else {
    setResourceSchema(
      documentSchema.setProperty('data', { type: 'object', required: true }),
      dataOptions.type,
    );
  }
};

export const createDataDocumentSchema = (
  parent: SchemaModelParent,
  dataOptions: PrimaryDataOptions,
): SchemaModel => {
  const documentSchema = SchemaFactory.create(parent, 'object');
  setDataDocumentSchema(documentSchema, dataOptions);
  return documentSchema;
};

// export const createErrorDocumentSchema = (parent: SchemaModelParent): SchemaModel => {
// };
