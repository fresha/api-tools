import { ParameterBase, ParameterParent } from './ParameterBase';

import type { QueryParameterSerializationStyle } from '../../../shared/types';
import type { QueryParameterModel } from '../types';

export class QueryParameter extends ParameterBase implements QueryParameterModel {
  #required: boolean;
  #allowEmptyValue: boolean;
  #style: QueryParameterSerializationStyle;
  #allowReserved: boolean;

  constructor(parent: ParameterParent, name: string) {
    super(parent, name);
    this.#required = false;
    this.#allowEmptyValue = false;
    this.#style = 'form';
    this.#allowReserved = false;
  }

  // eslint-disable-next-line class-methods-use-this
  get in(): 'query' {
    return 'query';
  }

  get required(): boolean {
    return this.#required;
  }

  set required(value: boolean) {
    this.#required = value;
  }

  get allowEmptyValue(): boolean {
    return this.#allowEmptyValue;
  }

  set allowEmptyValue(value: boolean) {
    this.#allowEmptyValue = value;
  }

  get style(): QueryParameterSerializationStyle {
    return this.#style;
  }

  set style(value: QueryParameterSerializationStyle) {
    this.#style = value;
  }

  get allowReserved(): boolean {
    return this.#allowReserved;
  }

  set allowReserved(value: boolean) {
    this.#allowReserved = value;
  }
}
