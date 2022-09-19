import { BasicNode } from './BasicNode';

import type { Components } from './Components';
import type { Encoding } from './Encoding';
import type { Example } from './Example';
import type { MediaType } from './MediaType';
import type { Response } from './Response';
import type { Schema } from './Schema';
import type { HeaderModel, MIMETypeString } from './types';
import type { Nullable, JSONValue } from '@fresha/api-tools-core';

export type HeaderParent = Components | Response | Encoding;

export type SerializationStyle = 'simple';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#header-object
 */
export class Header extends BasicNode<HeaderParent> implements HeaderModel {
  description: Nullable<string>;
  required: boolean;
  deprecated: boolean;
  style: SerializationStyle;
  explode: boolean;
  schema: Nullable<Schema>;
  example: JSONValue;
  readonly examples: Map<string, Example>;
  readonly content: Map<MIMETypeString, MediaType>;

  constructor(parent: HeaderParent) {
    super(parent);
    this.description = null;
    this.required = false;
    this.deprecated = false;
    this.style = 'simple';
    this.explode = false;
    this.schema = null;
    this.example = null;
    this.examples = new Map<string, Example>();
    this.content = new Map<MIMETypeString, MediaType>();
  }
}
