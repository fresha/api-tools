import { PathParameterSerializationStyle } from '../../../baseTypes';

import { ParameterBase, ParameterParent } from './ParameterBase';

import type { PathParameterModel } from '../types';

export class PathParameter extends ParameterBase implements PathParameterModel {
  #style: PathParameterSerializationStyle;

  constructor(parent: ParameterParent, name: string) {
    super(parent, name);
    this.#style = 'simple';
  }

  // eslint-disable-next-line class-methods-use-this
  get in(): 'path' {
    return 'path';
  }

  // eslint-disable-next-line class-methods-use-this
  get required(): true {
    return true;
  }

  get style(): PathParameterSerializationStyle {
    return this.#style;
  }

  set style(value: PathParameterSerializationStyle) {
    this.#style = value;
  }
}
