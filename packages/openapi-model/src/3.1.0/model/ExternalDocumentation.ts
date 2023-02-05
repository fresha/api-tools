import assert from 'assert';

import { Node } from './Node';

import type { OpenAPI } from './OpenAPI';
import type { Operation } from './Operation';
import type { Schema } from './Schema';
import type { Tag } from './Tag';
import type { ExternalDocumentationModel } from './types';
import type { CommonMarkString, Nullable, URLString } from '@fresha/api-tools-core';

type ExternalDocumentationParent = OpenAPI | Operation | Tag | Schema;

export class ExternalDocumentation
  extends Node<ExternalDocumentationParent>
  implements ExternalDocumentationModel
{
  #url: URLString;
  #description: Nullable<CommonMarkString>;

  constructor(parent: ExternalDocumentationParent, url: string) {
    super(parent);
    this.#url = url;
    this.#description = null;
  }

  get url(): URLString {
    return this.#url;
  }

  set url(value: URLString) {
    assert(!!value, `URL must not be an empty string`);
    this.#url = value;
  }

  get description(): Nullable<CommonMarkString> {
    return this.#description;
  }

  set description(value: Nullable<CommonMarkString>) {
    this.#description = value;
  }
}
