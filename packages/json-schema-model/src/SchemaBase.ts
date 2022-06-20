import { CommonMarkString, JSONValue, Nullable, TreeNode } from '@fresha/api-tools-core';
import { ITreeParent } from '@fresha/api-tools-core/build/TreeNode';

import type {
  ISchemaBase,
  ISchemaRegistry,
  JSONSchema,
  JSONSchemaType,
  SchemaFormat,
} from './types';

export type SchemaParent = ITreeParent<ISchemaRegistry> | JSONSchema;

const randomString = () => (Math.random() + 1).toString(36).substring(7);

export abstract class SchemaBase
  extends TreeNode<ISchemaRegistry, SchemaParent>
  implements ISchemaBase
{
  readonly id: string;
  readonly parent: SchemaParent;
  readonly type: JSONSchemaType;
  title: Nullable<string>;
  description: Nullable<CommonMarkString>;
  format: Nullable<SchemaFormat>;
  readonly extensionFields: Map<string, JSONValue>;
  nullable: boolean;
  default: JSONValue;
  example: JSONValue;

  constructor(parent: SchemaParent, type: JSONSchemaType) {
    super(parent);
    this.id = randomString();
    this.parent = parent;
    this.type = type;
    this.title = null;
    this.description = null;
    this.format = null;
    this.extensionFields = new Map<string, JSONValue>();
    this.format = null;
    this.nullable = false;
    this.default = null;
    this.example = null;
  }
}
