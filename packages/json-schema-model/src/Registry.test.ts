import { createSchemaRegistry } from './Registry';

test('construction', () => {
  const registry = createSchemaRegistry();

  const person = registry.add('object');
  person.addProperty('name', 'string');
  person.addProperty('age', 'number');
  person.addProperty('email', 'string');
});
