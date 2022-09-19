import { Parameter, ParameterParent } from './Parameter';
import { defaultRequired, defaultExplode } from './utils';

import type { QueryParameterModel, QueryParameterSerializationStyle } from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class QueryParameter extends Parameter implements QueryParameterModel {
  allowEmptyValue: boolean;
  style: QueryParameterSerializationStyle;
  explode: boolean;
  allowReserved: boolean;

  constructor(parent: ParameterParent, name: string) {
    super(parent, 'query', name);
    this.required = defaultRequired.query;
    this.allowEmptyValue = false; // since it is deprecated, always set to false
    this.style = 'form';
    this.explode = defaultExplode[this.style];
    this.allowReserved = false;
  }

  declare readonly in: 'query';
}
