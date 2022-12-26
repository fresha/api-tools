import type { Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

let i = 0;

export const schemaToType = (schema: Nullable<SchemaModel>): string => {
  switch (schema?.type) {
    case undefined:
    case null:
      return `Unknown${++i}`; // eslint-disable-line no-plusplus
    case 'boolean':
      return schema?.nullable ? 'boolean | null' : 'boolean';
    case 'integer':
    case 'number': {
      const elements: string[] = [];
      if (schema.enum?.length) {
        elements.push(...(schema.enum as string[]));
      } else {
        elements.push('number');
      }
      if (schema.nullable) {
        elements.push('null');
      }
      return elements.join(' | ');
    }
    case 'string': {
      const elements: string[] = [];
      if (schema.enum?.length) {
        for (const val of schema.enum) {
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
      const subtype = schemaToType(schema.items);
      return schema.nullable ? `${subtype}[] | null` : `${subtype}[]`;
    }
    default:
      return `Unknown${++i}`; // eslint-disable-line no-plusplus
  }
};

export const determineSchemaName = (schema: SchemaModel): string => {
  let primaryDataSchemaName = schema.title;
  if (!primaryDataSchemaName && schema.root.components === schema.parent) {
    for (const [title, sharedSchema] of schema.root.components.schemas) {
      if (schema === sharedSchema) {
        primaryDataSchemaName = title;
      }
    }
  }
  if (!primaryDataSchemaName) {
    primaryDataSchemaName = schemaToType(null);
  }
  return primaryDataSchemaName;
};
