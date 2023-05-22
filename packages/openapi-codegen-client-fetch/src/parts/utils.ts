import type { JSONValue, Nullable } from '@fresha/api-tools-core';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

let i = 0;

export const schemaToType = (schema: Nullable<SchemaModel>): string => {
  switch (schema?.type) {
    case undefined:
    case null: {
      if (schema?.oneOfCount) {
        const elements: string[] = [];
        for (const subSchema of schema.oneOf()) {
          elements.push(schemaToType(subSchema));
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
      const subtype = schemaToType(schema.items);
      return schema.nullable ? `${subtype}[] | null` : `${subtype}[]`;
    }
    case 'object': {
      const elements: string[] = [];
      for (const prop of schema.getProperties()) {
        const maybeQuotedName = prop.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
          ? prop.name
          : `'${prop.name}'`;
        elements.push(
          `${maybeQuotedName}${prop.required ? '' : '?'}: ${schemaToType(prop.schema)}`,
        );
      }
      return schema.nullable ? `{ ${elements.join('; ')} } | null` : `{ ${elements.join('; ')} }`;
    }
    default:
      return `Unknown${++i}`; // eslint-disable-line no-plusplus
  }
};

export const determineSchemaName = (schema: SchemaModel): string => {
  let primaryDataSchemaName = schema.title;
  if (!primaryDataSchemaName && schema.root.components === schema.parent) {
    for (const [title, sharedSchema] of schema.root.components.schemas()) {
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
