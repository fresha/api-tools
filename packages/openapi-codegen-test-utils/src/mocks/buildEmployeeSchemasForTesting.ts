import {
  addResourceAttributes,
  addResourceRelationships,
  RelationshipCardinality,
  setResourceSchema,
} from '@fresha/openapi-codegen-utils';

import type { OpenAPIModel, SchemaModel } from '@fresha/openapi-model/build/3.0.3';

export const buildEmployeeSchemasForTesting = (openapi: OpenAPIModel): SchemaModel => {
  const employee = openapi.components.setSchema('EmployeeResource');
  setResourceSchema(employee, 'employees');
  addResourceAttributes(employee, {
    name: { type: 'string', required: true },
    age: { type: 'number', nullable: true },
    gender: { type: 'string', enum: ['male', 'female', 'other'], nullable: true },
    active: { type: 'boolean', nullable: false },
  });
  addResourceRelationships(employee, {
    manager: { resourceType: 'employees', cardinality: RelationshipCardinality.One },
    buddy: { resourceType: 'employees', cardinality: RelationshipCardinality.ZeroOrOne },
    subordinates: { resourceType: 'employees', cardinality: RelationshipCardinality.Many },
  });
  return employee;
};
