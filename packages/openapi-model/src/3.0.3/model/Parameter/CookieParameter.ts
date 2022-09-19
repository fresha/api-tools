import { Parameter, ParameterParent } from './Parameter';
import { defaultExplode, defaultRequired, defaultSerializationStyles } from './utils';

import type { CookieParameterModel } from '../types';

export type SerializationStyle = 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class CookieParameter extends Parameter implements CookieParameterModel {
  style: SerializationStyle;
  explode: boolean;

  constructor(parent: ParameterParent, name: string) {
    super(parent, 'cookie', name);
    this.required = defaultRequired.cookie;
    this.style = defaultSerializationStyles.cookie as SerializationStyle;
    this.explode = defaultExplode[this.style];
  }

  declare readonly in: 'cookie';
}
