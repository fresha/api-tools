import { OpenAPI } from './OpenAPI';
import { Tag } from './Tag';

let parent: OpenAPI;
let tag: Tag;

beforeEach(() => {
  parent = new OpenAPI('Tag.test', '0.0.1');
  tag = new Tag(parent, 'tag#1');
});

test('constructor', () => {
  expect(tag.name).toBe('tag#1');
});

test('mutations', () => {
  expect(tag.description).toBeNull();

  tag.description = 'description#1';
  expect(tag.description).toBe('description#1');

  expect(tag.name).toBe('tag#1');
  expect(() => {
    tag.name = '';
  }).toThrow();
});

test('externalDocs', () => {
  expect(tag.externalDocs).toBeNull();

  const externalDocs = tag.setExternalDocs('https://www.example.com');
  expect(tag.externalDocs).toBe(externalDocs);
  expect(externalDocs.url).toBe('https://www.example.com');

  tag.deleteExternalDocs();
  expect(tag.externalDocs).toBeNull();
});
