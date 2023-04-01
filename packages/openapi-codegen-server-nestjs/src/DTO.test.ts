import { DTO } from './DTO';
import { createGenerator } from './testHelpers';

import type { Context } from './context';

test('construction', () => {
  const { context } = createGenerator('app', '/tmp');

  const dto = new DTO(context, 'SomeResponse', null);
  expect(dto.className).toBe('SomeResponse');
  expect(dto.outputPath).toBe('/tmp/dto/SomeResponse.dto.ts');
});

describe('serialization', () => {
  let context: Context = {} as Context;

  beforeEach(() => {
    context = createGenerator('app', '/var').context;
  });

  test('proper name and ouput path', () => {
    new DTO(context, 'SomeResponse2', null).generateCode();

    expect(context.project.getSourceFiles()).toHaveLength(2);
    expect(context.project.getSourceFileOrThrow('/var/app.module.ts')).toBeTruthy();
    expect(
      context.project.getSourceFileOrThrow('/var/dto/SomeResponse2.dto.ts').getText(),
    ).toMatchSnapshot();
  });

  test('primitive schemas + optionality', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      optionalBool: 'boolean',
      requiredBool: { type: 'boolean', required: true },
      numeric: 'number',
      requiredNum: { type: 'number', required: true },
      textual: 'string',
      requiredText: { type: 'string', required: true },
    });

    new DTO(context, 'Response', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Response.dto.ts').getText(),
    ).toMatchSnapshot();
  });

  test('numeric limits', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      min: { type: 'number', minimum: 10 },
      minExclusive: { type: 'number', minimum: 15, exclusiveMinimum: true },
      max: { type: 'number', maximum: 20 },
      maxExclusive: { type: 'number', maximum: 25, exclusiveMaximum: true },
      intMin: { type: 'integer', minimum: 10 },
      intMinExclusive: { type: 'integer', minimum: 15, exclusiveMinimum: true },
      intMax: { type: 'integer', maximum: 20 },
      intMaxExclusive: { type: 'integer', maximum: 25, exclusiveMaximum: true },
    });

    new DTO(context, 'Response', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Response.dto.ts').getText(),
    ).toMatchSnapshot();
  });

  test('string limits', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      minLen: { type: 'string', minLength: 1 },
      maxLen: { type: 'string', maxLength: 10 },
    });

    new DTO(context, 'Response2', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Response2.dto.ts').getText(),
    ).toMatchSnapshot();
  });

  test('object', () => {
    const resourceSchema = context.openapi.components.setSchema('Employee', 'object');
    resourceSchema.setProperties({
      type: { type: 'string', required: true, enum: ['1.0'] },
      id: { type: 'string', required: true },
      attributes: { type: 'object', required: true },
      relationships: { type: 'object', required: true },
    });

    resourceSchema.getPropertyOrThrow('attributes').setProperties({
      name: { type: 'string', required: true },
      age: 'number',
      active: 'boolean',
    });

    const relationshipsSchema = resourceSchema.getPropertyOrThrow('relationships');
    const providerRelationSchema = relationshipsSchema.setProperty('provider', {
      type: 'object',
      required: true,
    });
    const providerRelDataSchema = providerRelationSchema.setProperty('data', {
      type: 'object',
      required: true,
    });
    providerRelDataSchema.setProperties({
      type: { type: 'string', required: true },
      id: { type: 'string', required: true },
    });

    new DTO(context, 'Employee', resourceSchema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Employee.dto.ts').getText(),
    ).toMatchSnapshot();
  });

  test('array', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');

    schema.setProperty('intArray', 'array').setItems('integer');

    new DTO(context, 'AnotherResponse', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/AnotherResponse.dto.ts').getText(),
    ).toMatchSnapshot();
  });
});
