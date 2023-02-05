import assert from 'assert';

import { OAuthFlowBase, OAuthFlowParent } from './OAuthFlowBase';

import type { OAuthPasswordFlowModel } from '../../types';
import type { URLString } from '@fresha/api-tools-core';

export class OAuthPasswordFlow extends OAuthFlowBase implements OAuthPasswordFlowModel {
  #tokenUrl: URLString;

  constructor(parent: OAuthFlowParent, tokenUrl: URLString, refreshUrl: URLString) {
    super(parent, refreshUrl);
    this.#validateTokenUrl(tokenUrl);
    this.#tokenUrl = tokenUrl;
  }

  // eslint-disable-next-line class-methods-use-this
  #validateTokenUrl(value: URLString) {
    assert(value, 'Token URL cannot be empty');
  }

  get tokenUrl(): URLString {
    return this.#tokenUrl;
  }

  set tokenUrl(value: URLString) {
    this.#validateTokenUrl(value);
    this.#tokenUrl = value;
  }
}
