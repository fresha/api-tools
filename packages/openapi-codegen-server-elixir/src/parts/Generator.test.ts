import { createTestContext } from '../testHelpers';

import { Generator } from './Generator';

test('happy path', () => {
  const context = createTestContext('awesome_web', '/');

  const generator = new Generator(context);

  generator.run();
});
