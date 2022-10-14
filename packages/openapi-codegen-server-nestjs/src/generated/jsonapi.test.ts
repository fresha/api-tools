/* eslint-disable max-classes-per-file */
import 'reflect-metadata';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Expose, Type, instanceToPlain, plainToInstance } from 'class-transformer';
import {
  IsDefined, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsIn, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsNotEmpty, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsObject, // eslint-disable-line @typescript-eslint/no-unused-vars
  IsString, // eslint-disable-line @typescript-eslint/no-unused-vars
  ValidateNested, // eslint-disable-line @typescript-eslint/no-unused-vars
  validateSync,
} from 'class-validator';

// based on https://github.com/fresha/api-tools/blob/main/packages/openapi-model/examples/json-api.yaml

export class JSONAPIVersion {
  @Expose()
  @IsIn(['1.0'])
  version: string;

  constructor(version: string) {
    this.version = version;
  }
}

export class JSONAPIResourceId {
  @Expose()
  @IsString()
  @IsNotEmpty()
  type: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  id: string;

  constructor(type: string, id: string) {
    this.type = type;
    this.id = id;
  }
}

export class JSONAPIResourceIdList extends Array<JSONAPIResourceId> {}

export class JSONAPIRelationship {
  @Expose()
  @IsDefined()
  @ValidateNested({ each: true })
  @Type(() => JSONAPIResourceId)
  data?: JSONAPIResourceId | JSONAPIResourceId[];
}

export class JSONAPIResource {
  @Expose()
  @IsString()
  @IsNotEmpty()
  type?: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @Expose()
  @IsObject()
  attributes?: Record<string, unknown>;

  @Expose()
  @ValidateNested()
  relationships?: Record<string, JSONAPIRelationship>;
}

export class JSONAPIResourceList extends Array<JSONAPIResource> {}

export class JSONAPIDataDocument {
  @Expose()
  @Type(() => JSONAPIVersion)
  @ValidateNested()
  jsonapi?: JSONAPIVersion;

  @Expose()
  @Type(() => JSONAPIResource)
  @ValidateNested({ each: true })
  data?: JSONAPIResource | JSONAPIResource[] | JSONAPIResourceId | JSONAPIResourceId[];

  @Expose()
  @Type(() => JSONAPIResource)
  @ValidateNested({ each: true })
  included?: JSONAPIResource[];
}

export class JSONAPIErrorSource {
  @Expose()
  @IsNotEmpty()
  @IsString()
  pointer?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  parameter?: string;
}

export class JSONAPIError {
  @Expose()
  @IsNotEmpty()
  @IsString()
  id?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  status?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  code?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  detail?: string;

  @Expose()
  @ValidateNested()
  source?: JSONAPIErrorSource;
}

export class JSONAPIErrorList extends Array<JSONAPIError> {}

export class JSONAPIErrorDocument {
  @Expose()
  @Type(() => JSONAPIVersion)
  @ValidateNested()
  jsonapi?: JSONAPIVersion;

  @Expose()
  @ValidateNested({ each: true })
  @Type(() => JSONAPIError)
  errors?: JSONAPIError[];
}

describe('JSONAPIVersion', () => {
  describe('plainToInstance', () => {
    test('happy path', () => {
      const plainObj = { version: '1.0' };

      const instanceObj = plainToInstance(JSONAPIVersion, plainObj);
      expect(instanceObj).toHaveProperty('version', '1.0');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toStrictEqual([]);
    });

    test('incorrect version', () => {
      const plainObj = { version: '1.1' };

      const instanceObj = plainToInstance(JSONAPIVersion, plainObj);
      expect(instanceObj).toHaveProperty('version', '1.1');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
    });
  });

  describe('instanceToPlain', () => {
    test('happy path', () => {
      const instanceObj = new JSONAPIVersion('1.0');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(0);

      const plainObj = instanceToPlain(instanceObj);
      expect(plainObj).toStrictEqual({ version: '1.0' });
    });

    test('incorrect version', () => {
      const instanceObj = new JSONAPIVersion('1.1');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
    });
  });
});

describe('JSONAPIResourceId', () => {
  describe('plainToInstance', () => {
    test('single instance, happy path', () => {
      const plainObj = { type: 'customers', id: '1234' };

      const instanceObj = plainToInstance(JSONAPIResourceId, plainObj);
      expect(instanceObj).toHaveProperty('type', 'customers');
      expect(instanceObj).toHaveProperty('id', '1234');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toStrictEqual([]);
    });

    test('single instance, validation errors', () => {
      const plainObj = { type: 'customers', id: '' };

      const instanceObj = plainToInstance(JSONAPIResourceId, plainObj);
      expect(instanceObj).toHaveProperty('type', 'customers');
      expect(instanceObj).toHaveProperty('id', '');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
    });

    test('array, happy path', () => {
      const plainObjArr = [
        { type: 'customers', id: '1' },
        { type: 'customers', id: '2' },
      ];

      const instanceObjArr = plainToInstance(JSONAPIResourceId, plainObjArr);
      expect(instanceObjArr).toHaveLength(2);
      expect(instanceObjArr[0]).toHaveProperty('type', 'customers');
      expect(instanceObjArr[0]).toHaveProperty('id', '1');
      expect(instanceObjArr[1]).toHaveProperty('type', 'customers');
      expect(instanceObjArr[1]).toHaveProperty('id', '2');

      const validationResult = validateSync(instanceObjArr);
      expect(validationResult).toHaveLength(0);
    });

    test('array, validation errors', () => {
      const plainObjArr = [
        { type: '', id: '1' },
        { type: 'providers', id: '' },
      ];

      const instanceObjArr = plainToInstance(JSONAPIResourceId, plainObjArr);
      expect(instanceObjArr).toHaveLength(2);

      const validationResult = validateSync(instanceObjArr);
      expect(validationResult).toHaveLength(0); // TODO how to force validation of array items

      expect(validateSync(instanceObjArr[0])).toHaveLength(1); // works as expected
      expect(validateSync(instanceObjArr[1])).toHaveLength(1); // works as expected
    });
  });

  describe('instanceToPlain', () => {
    test('single instance', () => {
      const instanceObj = new JSONAPIResourceId('customers', '12');
      const plainObj = instanceToPlain(instanceObj);
      expect(plainObj).toStrictEqual({ type: 'customers', id: '12' });
    });

    test('multiple instances', () => {
      const instanceObjArr = [
        new JSONAPIResourceId('providers', '1'),
        new JSONAPIResourceId('customers', '2'),
      ];
      const plainObjArr = instanceToPlain(instanceObjArr);
      expect(plainObjArr).toStrictEqual([
        { type: 'providers', id: '1' },
        { type: 'customers', id: '2' },
      ]);
    });
  });
});

describe('JSONAPIRelationship', () => {
  describe('plainToInstance', () => {
    test('happy path, single element', () => {
      const plainObj = { data: { type: 'customers', id: '2' } };

      const instanceObj = plainToInstance(JSONAPIRelationship, plainObj);

      expect(instanceObj).toHaveProperty('data');
      expect(instanceObj.data).toBeInstanceOf(JSONAPIResourceId);
      expect(instanceObj.data).toHaveProperty('type', 'customers');
      expect(instanceObj.data).toHaveProperty('id', '2');

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(0);
    });

    test('happy path, multiple elements', () => {
      const plainObj = {
        data: [
          { type: 'customers', id: '1' },
          { type: 'employees', id: '2' },
        ],
      };

      const instanceObj = plainToInstance(JSONAPIRelationship, plainObj);

      expect(instanceObj).toHaveProperty('data');
      expect(instanceObj.data).toHaveLength(2);

      const dataAsArray = instanceObj.data as JSONAPIResourceId[];
      expect(dataAsArray[0]).toBeInstanceOf(JSONAPIResourceId);
      expect(dataAsArray[0]).toHaveProperty('type', 'customers');
      expect(dataAsArray[0]).toHaveProperty('id', '1');
      expect(dataAsArray[1]).toBeInstanceOf(JSONAPIResourceId);
      expect(dataAsArray[1]).toHaveProperty('type', 'employees');
      expect(dataAsArray[1]).toHaveProperty('id', '2');
    });

    test('validation errors, single element, empty', () => {
      const plainObj = {};

      const instanceObj = plainToInstance(JSONAPIRelationship, plainObj);

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
    });

    test('validation errors, single element, invalid attributes', () => {
      const plainObj = { data: { type: 'providers', id: '' } };

      const instanceObj = plainToInstance(JSONAPIRelationship, plainObj);

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
    });
  });

  describe('instanceToPlain', () => {});
});

describe('JSONAPIResource', () => {
  describe('plainToInstance', () => {
    test('happy path', () => {
      const plainObj = {
        type: 'customers',
        id: '2',
        attributes: {
          firstName: 'John',
          lastName: 'Dow',
        },
        relationships: {
          provider: {
            data: { type: 'providers', id: '1' },
          },
        },
      };

      const instanceObj = plainToInstance(JSONAPIResource, plainObj);

      expect(instanceObj).toHaveProperty('type', 'customers');
      expect(instanceObj).toHaveProperty('id', '2');
      expect(instanceObj).toHaveProperty('attributes', {
        firstName: 'John',
        lastName: 'Dow',
      });

      const validationResult = validateSync(instanceObj);

      expect(validationResult).toHaveLength(0);
    });

    test('validation errors', () => {
      const plainObj = {
        type: 'locations',
        id: '1',
      };

      const instanceObj = plainToInstance(JSONAPIResource, plainObj);
      expect(instanceObj).toHaveProperty('attributes', undefined);

      const validationResult = validateSync(instanceObj);

      expect(validationResult).toHaveLength(1);
      expect(validationResult[0]).toHaveProperty('constraints', {
        isObject: 'attributes must be an object',
      });
    });
  });
});

describe('JSONAPIDataDocument', () => {
  describe('plainToInstance', () => {
    test('happy path', () => {
      const plainObj = {
        jsonapi: { version: '1.0' },
        data: {
          type: 'customers',
          id: '1',
          attributes: {},
          relationships: {
            data: { type: 'providers', id: '1' },
          },
        },
        included: [
          {
            type: 'providers',
            id: '1',
            attributes: { name: 'Acme Hair' },
          },
        ],
      };

      const instanceObj = plainToInstance(JSONAPIDataDocument, plainObj);

      expect(instanceObj).toHaveProperty('jsonapi');
      expect(instanceObj.jsonapi).toHaveProperty('version', '1.0');
      expect(instanceObj).toHaveProperty('data');
      expect(instanceObj.data).toBeInstanceOf(JSONAPIResource);
      expect(instanceObj).toHaveProperty('included');
      expect(instanceObj.included).toHaveLength(1);
      expect(instanceObj.included![0]).toBeInstanceOf(JSONAPIResource);
    });

    test('validation errors', () => {
      const plainObj = {
        jsonapi: { version: '1.0' },
        data: [
          {
            type: 'locations',
            id: '',
            attributes: { name: 'loc1' },
            relationships: { data: { type: 'providers', id: '' } },
          },
          {
            type: 'locations',
            id: '2',
            attributes: { name: 'loc2' },
            relationships: { data: { type: 'providers', id: '1' } },
          },
        ],
      };

      const instanceObj = plainToInstance(JSONAPIDataDocument, plainObj);

      const validationResult = validateSync(instanceObj);
      expect(validationResult).toHaveLength(1);
      expect(validationResult[0].children).toHaveLength(1);
      expect(validationResult[0].children![0].children).toHaveLength(1);
      expect(validationResult[0].children![0].children![0]).toHaveProperty('constraints', {
        isNotEmpty: 'id should not be empty',
      });
    });
  });

  describe('instanceToPlain', () => {
    test('happy path', () => {
      const instanceObj = new JSONAPIDataDocument();
      instanceObj.jsonapi = new JSONAPIVersion('1.0');
      instanceObj.data = new JSONAPIResource();
      instanceObj.data.type = 'customers';
      instanceObj.data.id = 'walk-in';

      const plainObj = instanceToPlain(instanceObj);
      expect(plainObj).toStrictEqual({
        jsonapi: { version: '1.0' },
        data: {
          type: 'customers',
          id: 'walk-in',
          attributes: undefined,
          relationships: undefined,
        },
        included: undefined,
      });
    });
  });
});
