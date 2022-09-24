import { BasicNode } from './BasicNode';

import type {
  ExampleModel,
  HeaderModel,
  HeaderModelParent,
  HeaderParameterSerializationStyle,
  MediaTypeModel,
  SchemaModel,
} from './types';
import type { Nullable, JSONValue, MIMETypeString, CommonMarkString } from '@fresha/api-tools-core';

/**
 * @see http://spec.openapis.org/oas/v3.0.3#header-object
 */
export class Header extends BasicNode<HeaderModelParent> implements HeaderModel {
  description: Nullable<CommonMarkString>;
  required: boolean;
  deprecated: boolean;
  style: HeaderParameterSerializationStyle;
  explode: boolean;
  schema: Nullable<SchemaModel>;
  example: JSONValue;
  readonly examples: Map<string, ExampleModel>;
  readonly content: Map<MIMETypeString, MediaTypeModel>;

  constructor(parent: HeaderModelParent) {
    super(parent);
    this.description = null;
    this.required = false;
    this.deprecated = false;
    this.style = 'simple';
    this.explode = false;
    this.schema = null;
    this.example = null;
    this.examples = new Map<string, ExampleModel>();
    this.content = new Map<MIMETypeString, MediaTypeModel>();
  }
}
