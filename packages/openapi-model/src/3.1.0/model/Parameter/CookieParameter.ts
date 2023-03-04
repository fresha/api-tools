import { ParameterBase, ParameterParent } from './ParameterBase';

import type { CookieParameterSerializationStyle } from '../../../shared/types';
import type { CookieParameterModel } from '../types';

export class CookieParameter extends ParameterBase implements CookieParameterModel {
  #required: boolean;
  #style: CookieParameterSerializationStyle;

  constructor(parent: ParameterParent, name: string) {
    super(parent, name);
    this.#required = false;
    this.#style = 'form';
  }

  // eslint-disable-next-line class-methods-use-this
  get in(): 'cookie' {
    return 'cookie';
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
    this.#style = value;
  }
}
