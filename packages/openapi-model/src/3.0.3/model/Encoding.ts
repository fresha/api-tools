import { BasicNode } from './BasicNode';
import { Header } from './Header';

import type {
  EncodingModel,
  EncodingModelParent,
  EncodingSerializationStyle,
  HeaderModel,
} from './types';
import type { Nullable } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export class Encoding extends BasicNode<EncodingModelParent> implements EncodingModel {
  contentType: Nullable<string>;
  readonly headers: Map<string, HeaderModel>;
  style: EncodingSerializationStyle;
  explode: boolean;
  allowReserved: boolean;

  constructor(parent: EncodingModelParent, contentType: string) {
    super(parent);
    this.contentType = contentType;
    this.headers = new Map<string, HeaderModel>();
    this.style = 'form';
    this.explode = false;
    this.allowReserved = false;
  }

  setHeader(name: string): HeaderModel {
    const result = new Header(this);
    this.headers.set(name, result);
    return result;
  }

  deleteHeader(name: string): void {
    this.headers.delete(name);
  }

  clearHeaders(): void {
    this.headers.clear();
  }
}
