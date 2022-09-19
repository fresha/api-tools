import { BasicNode } from './BasicNode';

import type { Header } from './Header';
import type { MediaType } from './MediaType';
import type { EncodingModel } from './types';

export type EncodingParent = MediaType;

export type SerializationStyle = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#encoding-object
 */
export class Encoding extends BasicNode<EncodingParent> implements EncodingModel {
  contentType: string;
  readonly headers: Map<string, Header>;
  style: SerializationStyle;
  explode: boolean;
  allowReserved: boolean;

  constructor(parent: EncodingParent, contentType: string) {
    super(parent);
    this.contentType = contentType;
    this.headers = new Map<string, Header>();
    this.style = 'form';
    this.explode = false;
    this.allowReserved = false;
  }
}
