import { ParameterBase } from './ParameterBase';
import { defaultRequired, defaultExplode } from './utils';

import type {
  ParameterModelParent,
  QueryParameterModel,
  QueryParameterSerializationStyle,
} from '../types';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#parameter-object
 */
export class QueryParameter extends ParameterBase implements QueryParameterModel {
  declare readonly in: 'query';
  allowEmptyValue: boolean;
  style: QueryParameterSerializationStyle;
  explode: boolean;
  allowReserved: boolean;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'query', name);
    this.required = defaultRequired.query;
    this.allowEmptyValue = false; // since it is deprecated, always set to false
    this.style = 'form';
    this.explode = defaultExplode[this.style];
    this.allowReserved = false;
  }
}
