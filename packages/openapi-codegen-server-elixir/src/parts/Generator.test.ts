import { makeContext } from '../testHelpers';

import { Generator } from './Generator';

test('happy path', () => {
  const context = makeContext('awesome_web', '/');

  const generator = new Generator(context);

  generator.run();
});
