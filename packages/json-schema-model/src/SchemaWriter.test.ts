import { createSchemaRegistry } from './Registry';
import { SchemaWriter } from './SchemaWriter';

test('basic', () => {
  const registry = createSchemaRegistry();

  const schema = registry.add('object');

  const writer = new SchemaWriter();
  const data = writer.write(schema);

  expect(data).toStrictEqual({ type: 'object' });
});
