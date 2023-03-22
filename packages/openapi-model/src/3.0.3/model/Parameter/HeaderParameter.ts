import assert from 'assert';

import { ParameterBase } from './ParameterBase';
import { defaultExplode, defaultRequired } from './utils';

import type {
  HeaderParameterModel,
  HeaderParameterSerializationStyle,
  ParameterModelParent,
} from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class HeaderParameter extends ParameterBase<'header'> implements HeaderParameterModel {
  #required: boolean;
  #style: HeaderParameterSerializationStyle;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'header', name);
    this.#required = defaultRequired.header;
    this.#style = 'simple';
    this.explode = defaultExplode[this.#style];
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
  }

  get style(): HeaderParameterSerializationStyle {
    return this.#style;
  }

  set style(value: HeaderParameterSerializationStyle) {
    assert(value === 'simple', `Invalid style ${value}`);
    this.#style = value;
  }
}
