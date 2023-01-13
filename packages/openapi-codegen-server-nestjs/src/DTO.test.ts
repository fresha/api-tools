import '@fresha/openapi-codegen-test-utils/build/matchers';

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
      context.project.getSourceFileOrThrow('/var/dto/SomeResponse2.dto.ts'),
    ).toHaveFormattedTypeScriptText(`export class SomeResponse2 {}`);
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
      context.project.getSourceFileOrThrow('/var/dto/Response.dto.ts'),
    ).toHaveFormattedTypeScriptText(
      `import { Expose } from 'class-transformer';
      import { IsBoolean, IsInt, IsString } from 'class-validator';

      export class Response {
        @Expose()
        @IsBoolean()
        optionalBool?: boolean;

        @Expose()
        @IsBoolean()
        requiredBool: boolean;

        @Expose()
        @IsInt()
        numeric?: number;

        @Expose()
        @IsInt()
        requiredNum: number;

        @Expose()
        @IsString()
        textual?: string;

        @Expose()
        @IsString()
        requiredText: string;
      }`,
    );
  });

  test('numeric limits', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      min: { type: 'number', minimum: 10 },
      minExclusive: { type: 'number', exclusiveMinimum: 15 },
      max: { type: 'number', maximum: 20 },
      maxExclusive: { type: 'number', exclusiveMaximum: 25 },
    });

    new DTO(context, 'Response', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Response.dto.ts'),
    ).toHaveFormattedTypeScriptText(
      `import { Expose } from 'class-transformer';
      import { Min, Max, IsInt } from 'class-validator';

      export class Response {
        @Expose()
        @Min(10)
        @IsInt()
        min?: number;

        @Expose()
        @Min(15)
        @IsInt()
        minExclusive?: number;

        @Expose()
        @Max(20)
        @IsInt()
        max?: number;

        @Expose()
        @Max(25)
        @IsInt()
        maxExclusive?: number;
      }`,
    );
  });

  test('string limits', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      minLen: { type: 'string', minLength: 1 },
      maxLen: { type: 'string', maxLength: 10 },
    });

    new DTO(context, 'Response2', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/Response2.dto.ts'),
    ).toHaveFormattedTypeScriptText(
      `import { Expose } from 'class-transformer';
      import { MinLength, MaxLength, IsString } from 'class-validator';

      export class Response2 {
        @Expose()
        @MinLength(1)
        @IsString()
        minLen?: string;

        @Expose()
        @MaxLength(10)
        @IsString()
        maxLen?: string;
      }`,
    );
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

    expect(context.project.getSourceFileOrThrow('/var/dto/Employee.dto.ts'))
      .toHaveFormattedTypeScriptText(`
      import { Expose, Type } from 'class-transformer';
      import { IsInt, IsBoolean, IsString } from 'class-validator';

      export class Employee {
        @Expose()
        @IsString()
        type: string;

        @Expose()
        @IsString()
        id: string;

        @Expose()
        @Type(() => EmployeeAttributes)
        @ValidateNested()
        attributes: EmployeeAttributes;

        @Expose()
        @Type(() => EmployeeRelationships)
        @ValidateNested()
        relationships: EmployeeRelationships;
      }

      export class EmployeeAttributes {
        @Expose()
        @IsString()
        name: string;

        @Expose()
        @IsInt()
        age?: number;

        @Expose()
        @IsBoolean()
        active?: boolean;
      }

      export class EmployeeRelationships {
        @Expose()
        @Type(() => EmployeeRelationshipsProvider)
        @ValidateNested()
        provider: EmployeeRelationshipsProvider;
      }

      export class EmployeeRelationshipsProvider {
        @Expose()
        @Type(() => EmployeeRelationshipsProviderData)
        @ValidateNested()
        data: EmployeeRelationshipsProviderData;
      }

      export class EmployeeRelationshipsProviderData {
        @Expose()
        @IsString()
        type: string;

        @Expose()
        @IsString()
        id: string;
      }
    `);
  });

  test('array', () => {
    const schema = context.openapi.components.setSchema('Error', 'object');

    schema.setProperty('intArray', 'array').setItems('integer');

    new DTO(context, 'AnotherResponse', schema).generateCode();

    expect(
      context.project.getSourceFileOrThrow('/var/dto/AnotherResponse.dto.ts'),
    ).toHaveFormattedTypeScriptText(
      `import { Expose } from 'class-transformer';
      import { IsArray } from 'class-validator';

      export class AnotherResponse {
        @Expose()
        @IsArray()
        intArray?: number[];
      }`,
    );
  });
});
