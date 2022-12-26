import { OperationModel } from '@fresha/openapi-model/build/3.0.3';

import { assert } from './assert';

test('message', () => {
  const operation = {
    httpMethod: 'post',
    parent: {
      pathUrl: '/some-url/{id}',
    },
  } as OperationModel;

  expect(() => assert(true, 'This should pass', operation)).not.toThrow();
  expect(() => assert(false, 'Assertion failed', operation)).toThrow(
    "Assertion failed. Operation (POST '/some-url/{id}')",
  );
});
