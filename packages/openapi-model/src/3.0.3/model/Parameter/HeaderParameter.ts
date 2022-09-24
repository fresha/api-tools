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
export class HeaderParameter extends ParameterBase implements HeaderParameterModel {
  declare readonly in: 'header';
  style: HeaderParameterSerializationStyle;
  explode: boolean;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'header', name);
    this.required = defaultRequired.header;
    this.style = 'simple';
    this.explode = defaultExplode[this.style];
  }
}
