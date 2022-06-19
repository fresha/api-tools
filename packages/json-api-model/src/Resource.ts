import { ITreeParent, TreeNode } from '@fresha/api-tools-core';

import { Attribute } from './Attribute';
import { Relationship } from './Relationship';

import type { IAttribute, IRegistry, IRelationship, IResource } from './types';
import type {
  AddBooleanPropertyOptions,
  AddNumberPropertyOptions,
  AddStringPropertyOptions,
  JSONSchema,
  JSONSchemaType,
} from '@fresha/json-schema-model';

type ResourceParent = ITreeParent<IRegistry> | Resource;

export class Resource extends TreeNode<IRegistry, ResourceParent> implements IResource {
  readonly type: string;
  readonly id: IAttribute;
  readonly attributes: Map<string, IAttribute>;
  readonly relationships: Map<string, IRelationship>;

  constructor(parent: ResourceParent, type: string) {
    super(parent);
    this.type = type;
    this.id = new Attribute(this, 'string');
    this.attributes = new Map<string, Attribute>();
    this.relationships = new Map<string, Relationship>();
  }

  addAttribute(name: string, type: 'boolean', options?: AddBooleanPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'number', options?: AddNumberPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'string', options?: AddStringPropertyOptions): IAttribute;
  addAttribute(name: string, type: 'object'): IAttribute;
  addAttribute(name: string, type: 'array'): IAttribute;
  addAttribute(
    name: string,
    type: JSONSchemaType,
    options?: AddBooleanPropertyOptions | AddNumberPropertyOptions | AddStringPropertyOptions,
  ): IAttribute {
    if (this.attributes.has(name)) {
      throw new Error(`Duplicate attribute ${name}`);
    }
    switch (type) {
      case 'boolean': {
        const result = new Attribute(this, type, options as AddBooleanPropertyOptions);
        this.attributes.set(name, result);
        return result;
      }
      case 'number': {
        const result = new Attribute(this, type, options as AddNumberPropertyOptions);
        this.attributes.set(name, result);
        return result;
      }
      case 'string': {
        const result = new Attribute(this, type, options as AddStringPropertyOptions);
        this.attributes.set(name, result);
        return result;
      }
      case 'object': {
        const result = new Attribute(this, type);
        this.attributes.set(name, result);
        return result;
      }
      case 'array': {
        const result = new Attribute(this, type);
        this.attributes.set(name, result);
        return result;
      }
      default:
        throw new Error(`Unsupported attribute type ${type}`);
    }
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  clearAttributes(): void {
    this.attributes.clear();
  }

  addRelationship(name: string): IRelationship {
    if (this.relationships.has(name)) {
      throw new Error(`Duplicate relationship ${name}`);
    }
    const result = new Relationship();
    this.relationships.set(name, result);
    return result;
  }

  removeRelationship(name: string): void {
    this.relationships.delete(name);
  }

  clearRelationships(): void {
    this.relationships.clear();
  }

  // eslint-disable-next-line class-methods-use-this
  jsonSchema(): JSONSchema {
    throw new Error('Method not implemented.');
  }
}
