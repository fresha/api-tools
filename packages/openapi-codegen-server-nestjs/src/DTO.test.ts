import { OpenAPIFactory, SchemaFactory } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import '@fresha/jest-config';

import { DTO } from './DTO';
import { Generator } from './Generator';

test('construction', () => {
  const openapi = OpenAPIFactory.create();
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const fakeGenerator: Generator = {
    openapi,
    outputPath: '/tmp/',
    tsProject,
  } as Generator;

  const dto = new DTO(fakeGenerator, 'SomeResponse', null);
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
    new DTO(fakeGenerator, 'SomeResponse2', null).generateCode();

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

    new DTO(fakeGenerator, 'Response', schema).generateCode();

    expect(tsProject.getSourceFiles()).toHaveLength(1);
    expect(tsProject.getSourceFileOrThrow('/var/dto/Response.dto.ts')).toHaveFormattedText(
      `import { IsBoolean, IsInt, IsString } from 'class-validator';

      export class Response {
        @IsBoolean()
        optionalBool?: boolean;
        @IsBoolean()
        requiredBool: boolean;
        @IsInt()
        numeric?: number;
        @IsInt()
        requiredNum: number;
        @IsString()
        textual?: string;
        @IsString()
        requiredText: string;
      }`,
    );
  });

  test('numeric limits', () => {
    const schema = openapi.components.setSchema('Error', 'object');

    const min = schema.setProperty('min', 'number');
    min.minimum = 10;
    const minExclusive = schema.setProperty('minExclusive', 'number');
    minExclusive.exclusiveMinimum = 15;

    const max = schema.setProperty('max', 'number');
    max.maximum = 20;
    const maxExclusive = schema.setProperty('maxExclusive', 'number');
    maxExclusive.exclusiveMaximum = 25;

    new DTO(fakeGenerator, 'Response', schema).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Response.dto.ts')).toHaveFormattedText(
      `import { Min, IsInt, Max } from 'class-validator';

      export class Response {
        @Min(10)
        @IsInt()
        min?: number;
        @Min(15)
        @IsInt()
        minExclusive?: number;
        @Max(20)
        @IsInt()
        max?: number;
        @Max(25)
        @IsInt()
        maxExclusive?: number;
      }`,
    );
  });

  test('string limits', () => {
    const schema = openapi.components.setSchema('Error', 'object');

    const minLen = schema.setProperty('minLen', 'string');
    minLen.minLength = 1;

    const maxLen = schema.setProperty('maxLen', 'string');
    maxLen.maxLength = 10;

    new DTO(fakeGenerator, 'Response2', schema).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/Response2.dto.ts')).toHaveFormattedText(
      `import { MinLength, IsString, MaxLength } from 'class-validator';

      export class Response2 {
        @MinLength(1)
        @IsString()
        minLen?: string;
        @MaxLength(10)
        @IsString()
        maxLen?: string;
      }`,
    );
  });

  test('array', () => {
    const schema = openapi.components.setSchema('Error', 'object');

    const intArrayProp = schema.setProperty('intArray', 'array');
    intArrayProp.items = SchemaFactory.create(intArrayProp, 'integer');

    new DTO(fakeGenerator, 'AnotherResponse', schema).generateCode();

    expect(tsProject.getSourceFileOrThrow('/var/dto/AnotherResponse.dto.ts')).toHaveFormattedText(
      `import { IsArray } from 'class-validator';

      export class AnotherResponse {
        @IsArray()
        intArray?: number[];
      }`,
    );
  });
});
