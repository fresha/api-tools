import assert from 'assert';

import { titleCase } from '@fresha/api-tools-core';
import {
  SchemaFactory,
  SchemaModel,
  SchemaModelParent,
  CreateSchemaPropertyOptions,
} from '@fresha/openapi-model/build/3.0.3';
import pluralize from 'pluralize';

/**
 * Creates a null SchemaModel.
 *
 * @param parent schema parent
 * @returns a schema representing the (and only) null value
 */
export const createNullSchema = (parent: SchemaModelParent): SchemaModel => {
  let result: SchemaModel;

  if (parent.root.components === parent) {
    result = parent.root.components.setSchema('Null');
  } else {
    result = SchemaFactory.create(parent, null);
    result.title = 'Null';
  }
  result.addAllowedValues(null);

  return result;
};

/**
 * Given a SchemaModel instance, sets it to represent a JSON:API resource identifier.
 *
 * @param schema schema model to set up
 * @param resourceType JSON:API resource type. If not given, the resulting schema
 *  will represent a generic resource, without specific type
 * @see [JSON:API spec on resource identifiers](https://jsonapi.org/format/#document-resource-identifier-objects)
 * @see {@link createResourceIdSchema}
 */
export const setResourceIdSchema = (schema: SchemaModel, resourceType?: string): void => {
  assert(schema.type === 'object', "Resource ID schema must have type set to 'object'");
  if (resourceType) {
    schema.title = `${titleCase(pluralize.singular(resourceType))}ResourceID`;
  }
  schema.setProperties({
    type: {
      type: 'string',
      required: true,
      minLength: 1,
      enum: resourceType ? [resourceType] : undefined,
    },
    id: { type: 'string', required: true, minLength: 1 },
  });
};

/**
 * Creates a SchemaModel instance, representing a JSON:API resource identifier.
 * Uses {@link setResourceIdSchema} under the hood to set up the model.
 *
 * @param parent parent schema
 * @param resourceType JSON:API resource type
 * @returns a newly created schema model
 * @see [JSON:API spec on resource identifiers](https://jsonapi.org/format/#document-resource-identifier-objects)
 * @see {@link setResourceIdSchema}
 */
export const createResourceIdSchema = (
  parent: SchemaModelParent,
  resourceType?: string,
): SchemaModel => {
  const result = SchemaFactory.create(parent, 'object');
  setResourceIdSchema(result, resourceType);
  return result;
};

/**
 * Given a SchemaModel instance, sets it up to represent a JSON:API resource structure
 * with given resource type.
 *
 * @param schema schema model to set up
 * @param resourceType type of resource JSON:API resource
 * @see {@link createResourceSchema}
 * @see [JSON:API spec on resources](https://jsonapi.org/format/#document-resource-objects)
 */
export const setResourceSchema = (schema: SchemaModel, resourceType?: string): void => {
  assert(schema.type === null, `Resource schema must have type set to null`);

  if (resourceType) {
    schema.title = `${titleCase(pluralize.singular(resourceType))}Resource`;
  }

  const idSchema = schema.addAllOf('object');
  setResourceIdSchema(idSchema, resourceType);

  const bodySchema = schema.addAllOf('object');
  bodySchema.setProperties({
    attributes: { type: 'object', required: true },
    relationships: 'object',
  });
};

/**
 * Creates a SchemaModel instance representing a JSON:API resource structure
 * with given resource type.
 *
 * @param schema schema model to set up
 * @param resourceType type of JSON:API resource
 * @see {@link setResourceSchema}
 * @see [JSON:API spec on resources](https://jsonapi.org/format/#document-resource-objects)
 */
export const createResourceSchema = (parent: SchemaModelParent, type: string): SchemaModel => {
  const resourceSchema = SchemaFactory.create(parent, null);
  setResourceSchema(resourceSchema, type);
  return resourceSchema;
};

/**
 * Given a SchemaModel instance, representing a JSON:API resource, adds
 * a single attribute to it.
 *
 * @param resourceSchema resource SchemaModel
 * @param name attribute name
 * @param options properties of the attribute
 * @returns attribute's SchemaModel
 * @see {@link addResourceAttributes}
 * @see [JSON:API spec on resources](https://jsonapi.org/format/#document-resource-objects)
 */
export const addResourceAttribute = (
  resourceSchema: SchemaModel,
  name: string,
  options: CreateSchemaPropertyOptions,
): SchemaModel => {
  assert(resourceSchema.type === null, `Resource schema must have type set to null`);
  const attributesSchema = resourceSchema.allOfAt(1)?.getPropertyOrThrow('attributes');
  assert(attributesSchema?.type === 'object');
  return attributesSchema.setProperty(name, options);
};

/**
 * Given a SchemaModel instance that represents a JSON:API resource, adds multiple
 * attributes to it.
 *
 * @param resourceSchema resource schema
 * @param attrs map of attribute names to attribute schemas
 * @param options properties of the attribute
 * @see {@link addResourceAttribute}
 * @see [JSON:API spec on resources](https://jsonapi.org/format/#document-resource-objects)
 */
export const addResourceAttributes = (
  resourceSchema: SchemaModel,
  attrs: Record<string, CreateSchemaPropertyOptions>,
): void => {
  for (const [attrName, attrOptions] of Object.entries(attrs)) {
    addResourceAttribute(resourceSchema, attrName, attrOptions);
  }
};

export enum RelationshipCardinality {
  ZeroOrOne = '0',
  One = '1',
  Many = 'N',
}

/**
 * Given a SchemaModel instance, representing a JSON:API resource, adds subschemas
 * representing a relationship with given characteristics.
 *
 * @param resourceSchema schema to modify
 * @param name name of the relationship
 * @param resourceType type of the resource on the other side of the relationship
 * @param cardinality relationship cardinality
 * @param required is this relationship always present ? If not, the field is
 *  marked as optional
 * @see [JSON:API spec on relationships](https://jsonapi.org/format/#document-resource-object-relationships)
 * @see {@link addResourceRelationships}
 */
export const addResourceRelationship = (
  resourceSchema: SchemaModel,
  name: string,
  resourceType: string,
  cardinality: RelationshipCardinality = RelationshipCardinality.One,
  required = true,
): void => {
  const bodySchema = resourceSchema.allOfAt(1);
  assert(bodySchema?.type === 'object');

  let relationshipsSchema = bodySchema.getProperty('relationships');
  if (!relationshipsSchema) {
    relationshipsSchema = bodySchema.setProperty('relationships', 'object');
  }
  assert(relationshipsSchema.type === 'object');

  const relationshipSchema = relationshipsSchema.setProperty(name, {
    type: 'object',
    required,
  });
  switch (cardinality) {
    case RelationshipCardinality.Many: {
      const dataSchema = relationshipSchema.setProperty('data', 'array');
      dataSchema.setItems(createResourceIdSchema(dataSchema, resourceType));
      break;
    }
    case RelationshipCardinality.One: {
      const dataSchema = relationshipSchema.setProperty('data', 'object');
      setResourceIdSchema(dataSchema, resourceType);
      break;
    }
    case RelationshipCardinality.ZeroOrOne: {
      const dataSchema = relationshipSchema.setProperty('data', null);
      setResourceIdSchema(dataSchema.addAllOf('object'), resourceType);
      dataSchema.addAllOf(null).addAllowedValues(null);
      break;
    }
    default:
      assert.fail(`Unhandled cardinality ${String(cardinality)}`);
  }
};

type RelationshipSpec = {
  resourceType: string;
  cardinality?: RelationshipCardinality;
  required?: boolean;
};

/**
 * Given a SchemaModel instance, adds subschemas to it to represent JSON:API relationships
 * with specified characteristics.
 *
 * @param schema resource schema
 * @param relationships map of relationship specifications
 * @see [JSON:API spec on relationships](https://jsonapi.org/format/#document-resource-object-relationships)
 * @see {@link addResourceRelationships}
 */
export const addResourceRelationships = (
  schema: SchemaModel,
  relationships: Record<string, RelationshipSpec>,
): void => {
  for (const [relName, { resourceType, cardinality, required }] of Object.entries(relationships)) {
    addResourceRelationship(schema, relName, resourceType, cardinality, required);
  }
};

/**
 * Given a SchemaModel instance, sets it up to represent the structure of a JSON:API document
 * with given types of primary and included resources.
 *
 * @param documentSchema schema to modify
 * @param primaryResourceType type of primary data resources
 * @param includedResourceTypes types of included resources
 * @param multiplePrimaryResources if true, document primary data will be an array
 * @see [JSON:API spec on documents](https://jsonapi.org/format/#document-structure)
 * @see {@link createDataDocumentSchema}
 */
export const setDataDocumentSchema = (
  documentSchema: SchemaModel,
  primaryResourceType: string,
  includedResourceTypes?: string[],
  multiplePrimaryResources?: boolean,
): void => {
  assert(
    documentSchema.type === 'object',
    `Schema of JSON:API documents must have 'object' type. Got ${String(
      documentSchema.type,
    )} instead`,
  );

  documentSchema
    .setProperty('jsonapi', 'object')
    .setProperty('version', { type: 'string', required: true, enum: ['1.0'] });

  if (multiplePrimaryResources) {
    setResourceSchema(
      documentSchema.setProperty('data', 'array').setItems(null),
      primaryResourceType,
    );
  } else {
    const dataSchema = createResourceSchema(documentSchema, primaryResourceType);
    documentSchema.setProperty('data', { type: dataSchema, required: true });
  }

  if (includedResourceTypes?.length) {
    const includedItemSchema = documentSchema.setProperty('included', 'array').setItems(null);
    for (const includedType of includedResourceTypes) {
      const includedAltSchema = includedItemSchema.addAnyOf('object');
      setResourceIdSchema(includedAltSchema, includedType);
    }
  }
};

/**
 * Creates a SchemaModel instance defining the structure of a JSON:API document
 * with given types of primary and included resources.
 *
 * @param documentSchema schema to modify
 * @param primaryResourceType type of primary data resources
 * @param includedResourceTypes types of included resources
 * @param multiplePrimaryResources if true, document primary data will be an array
 * @returns a SchemaModel instance
 * @see [JSON:API spec on documents](https://jsonapi.org/format/#document-structure)
 * @see {@link setDataDocumentSchema}
 */
export const createDataDocumentSchema = (
  parent: SchemaModelParent,
  primaryResourceType: string,
  includedResourceTypes?: string[],
  multiplePrimaryResources?: boolean,
): SchemaModel => {
  const documentSchema = SchemaFactory.create(parent, 'object');
  setDataDocumentSchema(
    documentSchema,
    primaryResourceType,
    includedResourceTypes,
    multiplePrimaryResources,
  );
  return documentSchema;
};
