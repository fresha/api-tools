import {
  OpenAPIFactory,
  OpenAPIModel,
  SpecificationExtensionsModel,
} from '@fresha/openapi-model/build/3.0.3';

import { Differ } from './Differ';

import type { JSONObject } from '@fresha/api-tools-core';

let from: OpenAPIModel;
let to: OpenAPIModel;
let differ: Differ;

beforeEach(() => {
  from = OpenAPIFactory.create();
  to = OpenAPIFactory.create();
  differ = new Differ();
});

describe('extensionsDiff', () => {
  let model1: SpecificationExtensionsModel;
  let model2: SpecificationExtensionsModel;

  const setExtensions = (
    target: SpecificationExtensionsModel,
    attrs: JSONObject,
  ): SpecificationExtensionsModel => {
    for (const [key, value] of Object.entries(attrs)) {
      target.setExtension(key, value);
    }
    return target;
  };

  beforeEach(() => {
    model1 = setExtensions(from, { foo: 123, bar: 'hello' });
    model2 = setExtensions(to, { bar: 'world', baz: true });
  });

  test('handling nullish values', () => {
    expect(differ.extensionsDiff(null, null)).toBeUndefined();
    expect(differ.extensionsDiff(null, model1)).toStrictEqual({
      added: new Set(['foo', 'bar']),
      deleted: undefined,
      changed: undefined,
    });
    expect(differ.extensionsDiff(model1, null)).toStrictEqual({
      added: undefined,
      deleted: new Set(['foo', 'bar']),
      changed: undefined,
    });
  });

  test('returns undefined if there are no changes', () => {
    const diff = differ.extensionsDiff(model1, model1);
    expect(diff).toBeUndefined();
  });

  test('detects added extensions', () => {
    const diff = differ.extensionsDiff(model1, model2);
    expect(diff).toBeDefined();
    expect(diff?.added).toStrictEqual(new Set(['baz']));
    expect(diff?.deleted).toStrictEqual(new Set(['foo']));
    expect(diff?.changed).toStrictEqual(new Map([['bar', { from: 'hello', to: 'world' }]]));
  });

  test('detects deleted extensions', () => {
    const diff = differ.extensionsDiff(model2, model1);
    expect(diff).toBeDefined();
    expect(diff?.added).toStrictEqual(new Set(['foo']));
    expect(diff?.deleted).toStrictEqual(new Set(['baz']));
    expect(diff?.changed).toStrictEqual(new Map([['bar', { from: 'world', to: 'hello' }]]));
  });

  test('detects changed extensions', () => {
    const model3 = setExtensions(from, {
      foo: 123,
      bar: 'world',
      baz: false,
    });
    const diff = differ.extensionsDiff(model2, model3);
    expect(diff).toBeDefined();
    expect(diff?.added).toStrictEqual(new Set(['foo']));
    expect(diff?.deleted).toBeUndefined();
    expect(diff?.changed).toStrictEqual(new Map([['baz', { from: true, to: false }]]));
  });
});

test('same/identical model', () => {
  expect(differ.openapiDiff(from, from)).toBeUndefined();
  expect(differ.openapiDiff(from, to)).toBeUndefined();
});

describe('contact', () => {
  test('equal', () => {
    expect(differ.contactDiff(from.info.contact, from.info.contact)).toBeUndefined();
    expect(differ.contactDiff(from.info.contact, to.info.contact)).toBeUndefined();
  });

  test('different', () => {
    to.info.contact.name = 'test';

    expect(differ.contactDiff(from.info.contact, to.info.contact)).toStrictEqual({
      from: from.info.contact,
      to: to.info.contact,
      name: { from: from.info.contact.name, to: to.info.contact.name },
      url: undefined,
      email: undefined,
      extensions: undefined,
    });

    to.info.contact.url = 'https://test.com';
    to.info.contact.email = 'user@example.com';
    to.info.contact.setExtension('x-test', 'test');

    expect(differ.contactDiff(from.info.contact, to.info.contact)).toStrictEqual({
      from: from.info.contact,
      to: to.info.contact,
      name: { from: from.info.contact.name, to: to.info.contact.name },
      url: { from: from.info.contact.url, to: to.info.contact.url },
      email: { from: from.info.contact.email, to: to.info.contact.email },
      extensions: {
        added: new Set(['x-test']),
        deleted: undefined,
        changed: undefined,
      },
    });
  });
});

describe('license', () => {
  test('equal', () => {
    expect(differ.licenseDiff(from.info.license, from.info.license)).toBeUndefined();
    expect(differ.licenseDiff(from.info.license, to.info.license)).toBeUndefined();
  });

  test('different', () => {
    to.info.license.url = 'https://test.com';
    to.info.license.setExtension('x-test', 'test');

    expect(differ.licenseDiff(from.info.license, to.info.license)).toStrictEqual({
      from: from.info.license,
      to: to.info.license,
      name: undefined,
      url: { from: from.info.license.url, to: to.info.license.url },
      extensions: {
        added: new Set(['x-test']),
        deleted: undefined,
        changed: undefined,
      },
    });
  });
});

describe('info', () => {
  test('equal', () => {
    expect(differ.infoDiff(from.info, from.info)).toBeUndefined();
    expect(differ.infoDiff(from.info, to.info)).toBeUndefined();
  });

  test('different', () => {
    to.info.title = 'test';
    to.info.version = '1.0.0';
    to.info.description = 'test';
    to.info.termsOfService = 'https://test.com';
    to.info.contact.name = 'test';
    to.info.contact.url = 'https://test.com';
    to.info.contact.email = 'user@test.com';

    expect(differ.infoDiff(from.info, to.info)).toStrictEqual({
      from: from.info,
      to: to.info,
      title: { from: from.info.title, to: to.info.title },
      version: { from: from.info.version, to: to.info.version },
      description: { from: from.info.description, to: to.info.description },
      termsOfService: { from: from.info.termsOfService, to: to.info.termsOfService },
      contact: {
        from: from.info.contact,
        to: to.info.contact,
        name: { from: from.info.contact.name, to: to.info.contact.name },
        url: { from: from.info.contact.url, to: to.info.contact.url },
        email: { from: from.info.contact.email, to: to.info.contact.email },
        extensions: undefined,
      },
      license: undefined,
      extensions: undefined,
    });
  });
});

describe('externalDocumentation', () => {
  test('equal', () => {
    expect(differ.externalDocumentationDiff(from.externalDocs, from.externalDocs)).toBeUndefined();
    expect(differ.externalDocumentationDiff(from.externalDocs, to.externalDocs)).toBeUndefined();
  });

  test('created', () => {
    to.setExternalDocs('https://test.com');
    expect(differ.externalDocumentationDiff(from.externalDocs, to.externalDocs)).toStrictEqual({
      from: from.externalDocs,
      to: to.externalDocs,
      url: { from: undefined, to: to.externalDocs?.url },
      description: undefined,
      extensions: undefined,
    });
  });

  test('deleted', () => {
    from.setExternalDocs('https://test.com');
    expect(differ.externalDocumentationDiff(from.externalDocs, null)).toStrictEqual({
      from: from.externalDocs,
      to: null,
      url: { from: from.externalDocs?.url, to: undefined },
      description: undefined,
      extensions: undefined,
    });
  });

  test('different', () => {
    const fromExternalDocs = from.setExternalDocs('https://from.test.com');
    fromExternalDocs.description = 'from';
    fromExternalDocs.setExtension('x-from', 'from');

    const toExternalDocs = to.setExternalDocs('https://test.com');
    toExternalDocs.description = 'test';
    toExternalDocs.setExtension('x-test', 'to');

    expect(differ.externalDocumentationDiff(fromExternalDocs, toExternalDocs)).toStrictEqual({
      from: fromExternalDocs,
      to: toExternalDocs,
      url: { from: fromExternalDocs.url, to: toExternalDocs.url },
      description: { from: fromExternalDocs.description, to: toExternalDocs.description },
      extensions: {
        added: new Set(['x-test']),
        deleted: new Set(['x-from']),
        changed: undefined,
      },
    });
  });
});
