# @fresha/json-api-model

This package provides higher-level abstractions on JSON schemas representing JSON:API
documents and resources. This allows to save time and improve consistency of OpenAPI
schemas.

Technically, the package is intended to be used as a layer on top of
[@fresha/openapi-model](https://github.com/fresha/api-tools/tree/main/packages/openapi-model).

# Usage

Install with `npm install @fresha/json-api-model`.

## Programmatically building JSON:API schemas

```ts
import { createRegistry } from '@fresha/json-api-model';

const registry = createSchemaRegistry();

const organization = registry
  .addResource('organization')
  .addAttributes({
    name: 'string',
  })
  .addRelationships({
    employees: { other: 'employees', cardinality: 'many' }
  });

const employee = registry
  .addResource('employees')
  .addAttributes({
    name: { type: 'string', required: true },
    age: { type: 'number', nullable: true },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
  })
  .addRelationships({
    company: { other: organization, cardinality: 'one' },
    manager: { other: employee, cardinality: 'zero-or-one' },
    colleagues: { other: 'employees', cardinality: 'many' },
  });

console.log(registry.openapi.components.keys());

// Null
// OrganizationResourceID
// OrganizationResource
// OrganizationResourceRelationship1
// EmployeeResourceID
// EmployeeResource
// EmployeeResourceRelationship0
// EmployeeResourceRelationshipN
```

## Parsing existing OpenAPI schemas

```ts
const reader = new OpenAPIReader();
// assume that openapi.yaml contains definitions of a JSON:API API with
const openapi = reader.readFromFile('openapi.yaml');

const registry = parseOpenAPISchema(openapi);

registry.resourceNames();

// employees
// organizations

registry.getResourceOrThrow('employees').attributeNames();

// name
// age
// gender
```
