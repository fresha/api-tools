import assert from 'assert';

import type {
  JSONAPIRelationshipSchema,
  JSONAPIResourceSchema,
  RelationshipCardinality,
} from './types';
import type { SchemaModel } from '@fresha/openapi-model/build/3.0.3';

type RelationshipInfo = {
  resourceType: string;
  cardinality: RelationshipCardinality;
};

export const parseRelationshipSchema = (relSchema: SchemaModel): RelationshipInfo => {
  let cardinality: RelationshipCardinality;

  let relDataSchema = relSchema.getPropertyOrThrow('data');
  if (relDataSchema.type === 'array') {
    assert(relDataSchema.items && !Array.isArray(relDataSchema.items));
    relDataSchema = relDataSchema.items;
    cardinality = 'many';
  } else if (relDataSchema.isNullish()) {
    cardinality = 'zero-or-one';

    const alternatives = [...relDataSchema.oneOf(), ...relDataSchema.anyOf()].filter(
      s => !s.isNullish(),
    );
    assert(
      alternatives.length === 1,
      `Exactly one non-null schema is expected, but ${alternatives.length} got`,
    );
    [relDataSchema] = alternatives;
  } else {
    cardinality = 'one';
  }

  const resourceType = relDataSchema.getPropertyDeepOrThrow('type').allowedValueAt(0);
  assert(
    resourceType && typeof resourceType === 'string',
    `'data.type' property is missing or empty in JSON:API relationship schema`,
  );

  return { resourceType, cardinality };
};

export class Relationship implements JSONAPIRelationshipSchema {
  readonly #resource: JSONAPIResourceSchema;
  readonly #name: string;
  readonly #otherResource: JSONAPIResourceSchema;
  readonly #resourceType: string;
  readonly #cardinality: RelationshipCardinality;

  constructor(
    resource: JSONAPIResourceSchema,
    name: string,
    resourceType: string,
    cardinality: RelationshipCardinality,
  ) {
    this.#resource = resource;
    this.#name = name;
    this.#resourceType = resourceType;
    this.#cardinality = cardinality;

    let otherResource = this.#resource.registry.getResourceSchema(resourceType);
    if (!otherResource) {
      otherResource = this.#resource.registry.addResourceSchema(resourceType);
    }
    this.#otherResource = otherResource;
  }

  get resource(): JSONAPIResourceSchema {
    return this.#resource;
  }

  get name(): string {
    return this.#name;
  }

  get resourceType(): string {
    return this.#resourceType;
  }

  get otherResource(): JSONAPIResourceSchema {
    return this.#otherResource;
  }

  get cardinality(): RelationshipCardinality {
    return this.#cardinality;
  }

  get schema(): SchemaModel {
    return this.#resource.relationshipSchema(this.#cardinality);
  }
}
