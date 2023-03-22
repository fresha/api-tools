import assert from 'assert';

import { ParameterBase } from './ParameterBase';
import { defaultExplode } from './utils';

import type {
  ParameterModelParent,
  PathParameterModel,
  PathParameterSerializationStyle,
} from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class PathParameter extends ParameterBase<'path'> implements PathParameterModel {
  #style: PathParameterSerializationStyle;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'path', name);
    this.#style = 'simple';
    this.explode = defaultExplode[this.#style];
  }

  get style(): PathParameterSerializationStyle {
    return this.#style;
  }

  set style(value: PathParameterSerializationStyle) {
    assert(['matrix', 'label', 'simple'].includes(value), `Invalid style ${value}`);
    this.#style = value;
  }

  // eslint-disable-next-line class-methods-use-this
  get required(): true {
    return true;
  }
}
