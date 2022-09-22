import { JSONPointerResolver } from './JSONPointerResolver';

test('get', () => {
  const testObj = {
    numberProp: 1,
    objProp: {
      strProp: 'str',
      boolProp: true,
    },
    arrProp: [12, '34', { subProp: 'cdd' }],
    nullProp: null,
  };
  const resolver = new JSONPointerResolver(testObj);

  expect(resolver.get('/')).toBe(testObj);
  expect(resolver.get('/objProp/strProp')).toBe('str');
});
