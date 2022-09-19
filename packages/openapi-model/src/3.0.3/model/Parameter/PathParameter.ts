import { Parameter, ParameterParent } from './Parameter';
import { defaultExplode } from './utils';

import type { PathParameterSerializationStyle } from '../../types';
import type { PathParameterModel } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class PathParameter extends Parameter implements PathParameterModel {
  style: PathParameterSerializationStyle;
  explode: boolean;

  constructor(parent: ParameterParent, name: string) {
    super(parent, 'path', name);
    this.required = true;
    this.style = 'simple';
    this.explode = defaultExplode[this.style];
    this.required = true;
  }

  declare readonly in: 'path';
  declare readonly required: true;
}
