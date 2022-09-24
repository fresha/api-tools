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
export class PathParameter extends ParameterBase implements PathParameterModel {
  declare readonly in: 'path';
  declare readonly required: true;
  style: PathParameterSerializationStyle;
  explode: boolean;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'path', name);
    this.required = true;
    this.style = 'simple';
    this.explode = defaultExplode[this.style];
    this.required = true;
  }
}
