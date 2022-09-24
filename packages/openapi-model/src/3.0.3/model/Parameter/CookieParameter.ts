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
export class CookieParameter extends ParameterBase implements CookieParameterModel {
  declare readonly in: 'cookie';
  style: CookieParameterSerializationStyle;
  explode: boolean;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'cookie', name);
    this.required = defaultRequired.cookie;
    this.style = 'form';
    this.explode = defaultExplode[this.style];
  }
}
