import assert from 'assert';

import { ParameterBase } from './ParameterBase';
import { defaultExplode, defaultRequired } from './utils';

import type {
  CookieParameterModel,
  CookieParameterSerializationStyle,
  ParameterModelParent,
} from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class CookieParameter extends ParameterBase<'cookie'> implements CookieParameterModel {
  #required: boolean;
  #style: CookieParameterSerializationStyle;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'cookie', name);
    this.#required = defaultRequired.cookie;
    this.#style = 'form';
    this.explode = defaultExplode[this.#style];
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
  }

  get style(): CookieParameterSerializationStyle {
    return this.#style;
  }

  set style(value: CookieParameterSerializationStyle) {
    assert(value === 'form', `Invalid style ${value}`);
    this.#style = value;
  }
}
