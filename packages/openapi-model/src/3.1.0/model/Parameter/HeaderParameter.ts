import { ParameterBase, ParameterParent } from './ParameterBase';

import type { HeaderParameterSerializationStyle } from '../../../baseTypes';
import type { HeaderParameterModel } from '../types';

export class HeaderParameter extends ParameterBase implements HeaderParameterModel {
  #required: boolean;
  #style: HeaderParameterSerializationStyle;

  constructor(parent: ParameterParent, name: string) {
    super(parent, name);
    this.#required = false;
    this.#style = 'simple';
  }

  // eslint-disable-next-line class-methods-use-this
  get in(): 'header' {
    return 'header';
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
    this.#style = value;
  }
}
