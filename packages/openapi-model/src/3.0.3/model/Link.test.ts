import { OpenAPIFactory } from './OpenAPI';

let link = OpenAPIFactory.create().components.setLink('test');

beforeEach(() => {
  link = OpenAPIFactory.create().components.setLink('test');
});

test('parameters collection', () => {
  expect(link.parameters.size).toBe(0);

  link.setParameter('x', null);
  link.setParameter('y', 'monday');

  expect(link.parameters.size).toBe(2);
  expect(link.getParameter('x')).toBe(null);
  expect(link.getParameter('z')).toBeUndefined();
  expect(link.getParameterOrThrow('y')).toBe('monday');
  expect(() => link.getParameterOrThrow('t')).toThrow();

  link.deleteParameter('x');

  expect(Array.from(link.parameters.keys())).toStrictEqual(['y']);

  link.clearParameters();

  expect(link.parameters.size).toBe(0);
});
