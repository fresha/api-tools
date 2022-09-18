import type { ContactObject } from './types';

test('check ContactObject typings', () => {
  const contactObject1: ContactObject = {};
  expect(contactObject1).not.toBeNull();

  const contactObject2: ContactObject = {
    name: 'a',
    url: 'http://www.example.com',
    email: 'me@example.com',
    'x-ext': 1,
    // y: 2,
  };
  expect(contactObject2).not.toBeNull();
});
