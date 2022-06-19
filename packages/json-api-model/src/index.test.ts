import { createSchemaRegistry } from '@fresha/json-schema-model';

import { createRegistry } from './index';

test('define resources and relationshipns between them', () => {
  const schemaRegistry = createSchemaRegistry();
  const registry = createRegistry(schemaRegistry);

  const provider = registry.addResource('providers');
  provider.addAttribute('name', 'string');

  const employee = registry.addResource('customers');
  employee.addAttribute('name', 'string');
  employee.addAttribute('gender', 'string', { allowed: ['male', 'female'] });
  employee.addAttribute('age', 'number', { minimum: 21, maximum: 150 });

  const location = registry.addResource('locations');
  location.addAttribute('name', 'string');

  const booking = registry.addResource('bookings');
  booking.addAttribute('date', 'string');
  booking.addAttribute('status', 'string', { allowed: ['ready', 'in-progress', 'completed'] });

  provider.addRelationship('locations', location, 'provider', { type: 'one-to-many' });
  provider.addRelationship('bookings', booking, 'provider', { type: 'one-to-many' });

  location.addRelationship('bookings', booking, 'location', { type: 'one-to-many' });

  booking.addRelationship('employee', employee, 'bookings', { type: 'many-to-one' });
});
