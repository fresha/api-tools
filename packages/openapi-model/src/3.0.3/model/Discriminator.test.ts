import { OpenAPIFactory } from './OpenAPI';
import { ComponentsModel, SchemaModel } from './types';

let components: ComponentsModel;
let shape: SchemaModel;

beforeEach(() => {
  components = OpenAPIFactory.create().components;
  shape = components.setSchema('Shape', 'object');
});

test('basic logic', () => {
  shape.setProperties({
    kind: { type: 'string', enum: ['square', 'circle', 'triangle'], required: true },
    numberOfEdges: { type: 'number', required: true },
  });

  shape.addOneOf(components.setSchema('Square'));
  shape.addOneOf(components.setSchema('Cirlce'));
  shape.addAllOf(components.setSchema('Triangle'));

  const discriminator = shape.setDiscriminator('kind');

  expect(discriminator.propertyName).toBe('kind');
  expect(discriminator.mappingCount).toBe(0);

  expect(() => {
    discriminator.propertyName = 'iDoNotExist';
  }).toThrow();

  discriminator.setMapping('square', 'Square');
  discriminator.setMapping('circle', 'Circle');
  discriminator.setMapping('triangle', 'Triangle');

  expect(discriminator.mappingCount).toBe(3);
  expect([...discriminator.mappingKeys()]).toStrictEqual(['square', 'circle', 'triangle']);
  expect([...discriminator.mappings()]).toStrictEqual([
    ['square', 'Square'],
    ['circle', 'Circle'],
    ['triangle', 'Triangle'],
  ]);
  expect(discriminator.hasMapping('circle')).toBeTruthy();
  expect(discriminator.hasMapping('octagon')).toBeFalsy();
  expect(discriminator.getMapping('triangle')).toBe('Triangle');
  expect(discriminator.getMappingOrThrow('triangle')).toBe('Triangle');

  discriminator.deleteMapping('circle');
  expect(discriminator.mappingCount).toBe(2);
  expect(discriminator.getMapping('circle')).toBeUndefined();
  expect(() => discriminator.getMappingOrThrow('circle')).toThrow();

  discriminator.clearMappings();
  expect(discriminator.mappingCount).toBe(0);
});
