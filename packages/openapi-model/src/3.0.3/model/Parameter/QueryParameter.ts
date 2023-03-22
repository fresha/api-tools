import assert from 'assert';

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
export class QueryParameter extends ParameterBase<'query'> implements QueryParameterModel {
  #required: boolean;
  #allowEmptyValue: boolean;
  #style: QueryParameterSerializationStyle;
  #allowReserved: boolean;

  constructor(parent: ParameterModelParent, name: string) {
    super(parent, 'query', name);
    this.#required = defaultRequired.query;
    this.#allowEmptyValue = false; // since it is deprecated, always set to false
    this.#style = 'form';
    this.explode = defaultExplode[this.#style];
    this.#allowReserved = false;
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
    assert(
      ['form', 'spaceDelimited', 'pipeDelimited', 'deepObject'].includes(value),
      `Invalid style ${value}`,
    );
    this.#style = value;
  }

  get allowReserved(): boolean {
    return this.#allowReserved;
  }

  set allowReserved(value: boolean) {
    this.#allowReserved = value;
  }
}
