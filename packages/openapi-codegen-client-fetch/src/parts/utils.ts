import {
  camelCase,
  kebabCase,
  type JSONValue,
  type Nullable,
  snakeCase,
  titleCase,
} from '@fresha/api-tools-core';

import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export type NamingConvention = 'camel' | 'kebab' | 'snake' | 'title';

export const propertyName = (name: string, convention: Nullable<NamingConvention>): string => {
  let result;
  switch (convention) {
    case 'camel':
      result = camelCase(name);
      break;
    case 'kebab':
      result = kebabCase(name);
      break;
    case 'snake':
      result = snakeCase(name);
      break;
    case 'title':
      result = titleCase(name);
      break;
    default:
      result = name;
  }
  return result.match(/^[_A-Za-z][_0-9A-Za-z]*$/) ? result : `'${result}'`;
};

export const objectPropertyName = (objectName: string, propName: string): string => {
  return propName.match(/^[_A-Za-z][_0-9A-Za-z]*$/)
    ? `${objectName}.${propName}`
    : `${objectName}[${propName}]`;
};

let i = 0;

export const schemaToType = (
  schema: Nullable<SchemaModel>,
  convention: Nullable<NamingConvention>,
): string => {
  switch (schema?.type) {
    case undefined:
    case null: {
      if (schema?.oneOfCount) {
        const elements: string[] = [];
        for (const subSchema of schema.oneOf()) {
          elements.push(schemaToType(subSchema, convention));
        }
        return elements.join(' | ');
      }

      return `Unknown${++i}`; // eslint-disable-line no-plusplus
    }
    case 'boolean':
      return schema?.nullable ? 'boolean | null' : 'boolean';
    case 'integer':
    case 'number': {
      const elements: JSONValue[] = [];
      if (schema.allowedValueCount) {
        elements.push(...schema.allowedValues());
      } else {
        elements.push('number');
      }
      if (schema.nullable) {
        elements.push('null');
      }
      return elements.join(' | ');
    }
    case 'string': {
      const elements: JSONValue[] = [];
      if (schema.allowedValueCount) {
        for (const val of schema.allowedValues()) {
          elements.push(`'${val as string}'`);
        }
      } else {
        elements.push('string');
      }
      if (schema.nullable) {
        elements.push('null');
      }
      return elements.join(' | ');
    }
    case 'array': {
      const subtype = schemaToType(schema.items, convention);
      return schema.nullable ? `${subtype}[] | null` : `${subtype}[]`;
    }
    case 'object': {
      const elements: string[] = [];
      for (const prop of schema.getProperties()) {
        elements.push(
          `${propertyName(prop.name, 'camel')}${prop.required ? '' : '?'}: ${schemaToType(
            prop.schema,
            convention,
          )}`,
        );
      }
      return schema.nullable ? `{ ${elements.join('; ')} } | null` : `{ ${elements.join('; ')} }`;
    }
    default:
      return `Unknown${++i}`; // eslint-disable-line no-plusplus
  }
};

export const determineSchemaName = (
  schema: SchemaModel,
  convention: Nullable<NamingConvention>,
): string => {
  let primaryDataSchemaName = schema.title;
  if (!primaryDataSchemaName && schema.root.components === schema.parent) {
    for (const [title, sharedSchema] of schema.root.components.schemas()) {
      if (schema === sharedSchema) {
        primaryDataSchemaName = title;
      }
    }
  }
  if (!primaryDataSchemaName) {
    primaryDataSchemaName = schemaToType(null, convention);
  }
  return primaryDataSchemaName;
};
