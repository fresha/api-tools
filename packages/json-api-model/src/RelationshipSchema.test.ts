import { OpenAPIFactory, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

import { parseRelationshipSchema } from './RelationshipSchema';

let nullSchema: SchemaModel;
let relSchema: SchemaModel;
let dataSchema: SchemaModel;

beforeEach(() => {
  const { components } = OpenAPIFactory.create();
  nullSchema = components.setSchema('Null');
  nullSchema.enum = [null];
  relSchema = components.setSchema('RelationshipTest', 'object');
  dataSchema = relSchema.setProperty('data', null);
});

describe('parseRelationshipSchema', () => {
  test('zero-or-one', () => {
    dataSchema.addAnyOf('object').setProperties({
      type: { type: 'string', enum: ['payments'], required: true },
      id: { type: 'string', required: true },
    });
    dataSchema.addAnyOf(nullSchema);

    expect(parseRelationshipSchema(relSchema)).toStrictEqual({
      resourceType: 'payments',
      cardinality: 'zero-or-one',
    });
  });

  test('one', () => {
    dataSchema
      .addAllOf('object')
      .setProperty('type', { type: 'string', enum: ['payments'], required: true });
    dataSchema.addAllOf('object').setProperty('id', { type: 'string', required: true });

    expect(parseRelationshipSchema(relSchema)).toStrictEqual({
      resourceType: 'payments',
      cardinality: 'one',
    });
  });

  test('many', () => {
    dataSchema.type = 'array';
    dataSchema.setItems('object').setProperties({
      type: { type: 'string', enum: ['payments'] },
      id: 'string',
    });

    expect(parseRelationshipSchema(relSchema)).toStrictEqual({
      resourceType: 'payments',
      cardinality: 'many',
    });
  });

  test('invalid many', () => {
    dataSchema.setItems('object').setProperties({
      type: { type: 'string', enum: ['payments'] },
      id: 'string',
    });

    expect(() => parseRelationshipSchema(relSchema)).toThrow();
  });
});
