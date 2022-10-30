import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import '@fresha/jest-config';

import { DTO } from './DTO';
import { Generator } from './Generator';

const logger = createLogger(false);

test('construction', () => {
  const openapi = OpenAPIFactory.create();
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const fakeGenerator: Generator = {
    openapi,
    outputPath: '/tmp/',
    tsProject,
  } as Generator;

  const dto = new DTO(fakeGenerator, 'SomeResponse', null, logger);
  expect(dto.className).toBe('SomeResponse');
  expect(dto.outputPath).toBe('/tmp/dto/SomeResponse.dto.ts');
});

describe('serialization', () => {
  let openapi = OpenAPIFactory.create();
  let tsProject = new Project({ useInMemoryFileSystem: true });
  let fakeGenerator: Generator = {} as Generator;

  beforeEach(() => {
    openapi = OpenAPIFactory.create();
    tsProject = new Project({ useInMemoryFileSystem: true });
    fakeGenerator = {
      openapi,
      outputPath: '/var',
      tsProject,
    } as unknown as Generator;
  });

  test('proper name and ouput path', () => {
    new DTO(fakeGenerator, 'SomeResponse2', null, logger).generateCode();

    expect(tsProject.getSourceFiles()).toHaveLength(1);
    expect(tsProject.getSourceFileOrThrow('/var/dto/SomeResponse2.dto.ts')).toHaveFormattedText(
      `export class SomeResponse2 {}`,
    );
  });

  test('primitive schemas + optionality', () => {
    const schema = openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      optionalBool: 'boolean',
      requiredBool: { type: 'boolean', required: true },
      numeric: 'number',
      requiredNum: { type: 'number', required: true },
      textual: 'string',
      requiredText: { type: 'string', required: true },
    });

    new DTO(fakeGenerator, 'Response', schema, logger).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Response.dto.ts')).toHaveFormattedText(
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
    const schema = openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      min: { type: 'number', minimum: 10 },
      minExclusive: { type: 'number', exclusiveMinimum: 15 },
      max: { type: 'number', maximum: 20 },
      maxExclusive: { type: 'number', exclusiveMaximum: 25 },
    });

    new DTO(fakeGenerator, 'Response', schema, logger).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Response.dto.ts')).toHaveFormattedText(
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
    const schema = openapi.components.setSchema('Error', 'object');
    schema.setProperties({
      minLen: { type: 'string', minLength: 1 },
      maxLen: { type: 'string', maxLength: 10 },
    });

    new DTO(fakeGenerator, 'Response2', schema, logger).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Response2.dto.ts')).toHaveFormattedText(
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
    const resourceSchema = openapi.components.setSchema('Employee', 'object');
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

    new DTO(fakeGenerator, 'Employee', resourceSchema, logger).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Employee.dto.ts')).toHaveFormattedText(`
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
    const schema = openapi.components.setSchema('Error', 'object');

    const intArrayProp = schema.setProperty('intArray', 'array');
    intArrayProp.items = SchemaFactory.create(intArrayProp, 'integer');

    new DTO(fakeGenerator, 'AnotherResponse', schema, logger).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/AnotherResponse.dto.ts')).toHaveFormattedText(
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
