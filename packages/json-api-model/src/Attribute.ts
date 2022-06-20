import { TreeNode } from '@fresha/api-tools-core';
import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import { Registry } from './Registry';
import { Resource } from './Resource';

import type { IAttribute, IRegistry } from './types';
import type {
  AddBooleanSchemaOptions,
  AddNumberSchemaOptions,
  AddStringSchemaOptions,
  JSONSchema,
  JSONSchemaType,
} from '@fresha/json-schema-model';

type AttributeParent = ITreeParent<Registry> | Resource;

export class Attribute extends TreeNode<IRegistry, AttributeParent> implements IAttribute {
  private schema: JSONSchema;

  constructor(parent: AttributeParent, type: 'boolean', options?: AddBooleanSchemaOptions);
  constructor(parent: AttributeParent, type: 'number', options?: AddNumberSchemaOptions);
  constructor(parent: AttributeParent, type: 'string', options?: AddStringSchemaOptions);
  constructor(parent: AttributeParent, type: 'object');
  constructor(parent: AttributeParent, type: 'array');
  constructor(
    parent: AttributeParent,
    type: JSONSchemaType,
    options?: AddBooleanSchemaOptions | AddNumberSchemaOptions | AddStringSchemaOptions,
  ) {
    super(parent);
    switch (type) {
      case 'boolean':
        this.schema = parent.root.schemaRegistry.add(type, options as AddBooleanSchemaOptions);
        break;
      case 'number':
        this.schema = parent.root.schemaRegistry.add(type, options as AddNumberSchemaOptions);
        break;
      case 'string':
        this.schema = parent.root.schemaRegistry.add(type, options as AddStringSchemaOptions);
        break;
      case 'object':
        this.schema = parent.root.schemaRegistry.add(type);
        break;
      case 'array':
        this.schema = parent.root.schemaRegistry.add(type);
        break;
      default:
        throw new Error(`Unsupported schema type ${type}`);
    }
  }

  jsonSchema(): JSONSchema {
    return this.schema;
  }
}
