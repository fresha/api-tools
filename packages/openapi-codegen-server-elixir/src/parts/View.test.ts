import { createTestContext } from '../testHelpers';

import { View } from './View';

test('happy path', () => {
  const context = createTestContext('api_tests_web');
  const view = new View(context, 'UsersView');
  expect(view).toBeTruthy();
});
