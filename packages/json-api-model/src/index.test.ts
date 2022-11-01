import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';

import { createRegistry } from './index';

test('define resources and relationshipns between them', () => {
  const openapi = OpenAPIFactory.create();

  const providerSchema = openapi.components.setSchema('Provider', 'object');
  providerSchema.setProperties({
    type: { type: 'string', required: true, enum: ['providers'] },
    id: { type: 'string', required: true },
    attributes: { type: 'object', required: true },
    relationships: { type: 'object', required: true },
  });
  providerSchema.getPropertyOrThrow('attributes').setProperties({
    name: { type: 'string', required: true },
  });

  const employeeSchema = openapi.components.setSchema('Employee', 'object');
  employeeSchema.setProperties({
    type: { type: 'string', required: true, enum: ['employees'] },
    id: { type: 'string', required: true },
    attributes: { type: 'object', required: true },
    relationships: { type: 'object', required: true },
  });
  employeeSchema.getPropertyOrThrow('attributes').setProperties({
    name: { type: 'string', required: true },
    gender: { type: 'string' },
    age: { type: 'integer' },
  });
  employeeSchema
    .getPropertyOrThrow('relationships')
    .setProperty('provider', 'object')
    .setProperty('data', { type: 'object', required: true })
    .setProperties({
      type: { type: 'string', required: true, enum: ['providers'] },
      id: { type: 'string', required: true },
    });

  const locationSchema = openapi.components.setSchema('Location', 'object');
  locationSchema.setProperties({
    type: { type: 'string', required: true, enum: ['locations'] },
    id: { type: 'string', required: true },
    attributes: { type: 'object', required: true },
    relationships: { type: 'object', required: true },
  });
  locationSchema.getPropertyOrThrow('attributes').setProperties({
    name: { type: 'string', required: true },
  });
  locationSchema
    .getPropertyOrThrow('relationships')
    .setProperty('provider', 'object')
    .setProperty('data', { type: 'object', required: true })
    .setProperties({
      type: { type: 'string', required: true, enum: ['providers'] },
      id: { type: 'string', required: true },
    });

  const bookingSchema = openapi.components.setSchema('Booking', 'object');
  bookingSchema.setProperties({
    type: { type: 'string', required: true, enum: ['bookings'] },
    id: { type: 'string', required: true },
    attributes: { type: 'object', required: true },
    relationships: { type: 'object', required: true },
  });
  bookingSchema.getPropertyOrThrow('attributes').setProperties({
    date: { type: 'string', required: true },
    status: { type: 'string', required: true },
  });
  bookingSchema
    .getPropertyOrThrow('relationships')
    .setProperty('provider', 'object')
    .setProperty('data', { type: 'object', required: true })
    .setProperties({
      type: { type: 'string', required: true, enum: ['employees'] },
      id: { type: 'string', required: true },
    });

  const registry = createRegistry();

  registry.parseResource(providerSchema);
  registry.parseResource(employeeSchema);
  registry.parseResource(locationSchema);
  registry.parseResource(bookingSchema);

  const provider = registry.getResourceOrThrow('providers');
  expect(provider.getAttributeNames()).toStrictEqual(['name']);
  expect(provider.getRelationshipNames()).toStrictEqual([]);

  const employee = registry.getResourceOrThrow('employees');
  expect(employee.getAttributeNames()).toStrictEqual(['name', 'gender', 'age']);
  expect(employee.getRelationshipNames()).toStrictEqual(['provider']);

  const location = registry.getResourceOrThrow('locations');
  expect(location.getAttributeNames()).toStrictEqual(['name']);
  expect(location.getRelationshipNames()).toStrictEqual(['provider']);

  const booking = registry.getResourceOrThrow('bookings');
  expect(booking.getAttributeNames()).toStrictEqual(['date', 'status']);
  expect(employee.getRelationshipNames()).toStrictEqual(['provider']);
});
