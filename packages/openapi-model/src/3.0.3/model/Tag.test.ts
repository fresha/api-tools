import { OpenAPI } from './OpenAPI';
import { Tag } from './Tag';

let parent: OpenAPI;

beforeEach(() => {
  parent = new OpenAPI('Tag.test', '0.0.1');
});

test('constructor', () => {
  const tag = new Tag(parent, 'tag#1');
  expect(tag.name).toBe('tag#1');
});
