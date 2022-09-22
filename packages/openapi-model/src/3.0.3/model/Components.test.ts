import { OpenAPI } from './OpenAPI';

let { components } = new OpenAPI('Example', '0.1.0');

beforeEach(() => {
  components = new OpenAPI('Example', '0.1.0').components;
});

describe('schemas', () => {
  beforeEach(() => {
    components.setSchema('Integer', 'integer');
    components.setSchema('Empty');
  });

  test('setSchema', () => {
    expect(components.schemas.size).toBe(2);

    const integerSchema = components.schemas.get('Integer');
    expect(integerSchema).toHaveProperty('parent', components);

    const emptySchema = components.schemas.get('Empty');
    expect(emptySchema).toHaveProperty('parent', components);
  });

  test('deleteSchema', () => {
    components.deleteSchema('Empty');
    expect(Array.from(components.schemas.keys())).toStrictEqual(['Integer']);
  });

  test('clearSchemas', () => {
    components.clearSchemas();
    expect(components.schemas.size).toBe(0);
  });
});

describe('responses', () => {
  beforeEach(() => {
    components.setResponse('Success', 'Success response');
    components.setResponse('Error500', 'Error 5xx');
  });

  test('setResponse', () => {
    expect(components.responses.size).toBe(2);

    const successResponse = components.responses.get('Success');
    expect(successResponse).toHaveProperty('parent', components);

    const errorResponse = components.responses.get('Error500');
    expect(errorResponse).toHaveProperty('parent', components);
  });

  test('deleteResponse', () => {
    components.deleteResponse('Success');

    expect(Array.from(components.responses.keys())).toStrictEqual(['Error500']);
  });

  test('clearResponses', () => {
    components.clearResponses();

    expect(components.responses.size).toBe(0);
  });
});

describe('parameters', () => {
  beforeEach(() => {
    components.setParameter('ID', 'path', 'id');
    components.setParameter('Offset', 'query', 'offset');
    components.setParameter('Language', 'header', 'Language');
    components.setParameter('SessionID', 'cookie', 'session');
  });

  test('setParameter', () => {
    expect(components.parameters.size).toBe(4);

    const idParam = components.parameters.get('ID');
    expect(idParam).toHaveProperty('parent', components);
    expect(idParam).toHaveProperty('in', 'path');
    expect(idParam).toHaveProperty('name', 'id');

    const offsetParam = components.parameters.get('Offset');
    expect(offsetParam).toHaveProperty('parent', components);
    expect(offsetParam).toHaveProperty('in', 'query');
    expect(offsetParam).toHaveProperty('name', 'offset');

    const languageParam = components.parameters.get('Language');
    expect(languageParam).toHaveProperty('parent', components);
    expect(languageParam).toHaveProperty('in', 'header');
    expect(languageParam).toHaveProperty('name', 'Language');

    const sessionParam = components.parameters.get('SessionID');
    expect(sessionParam).toHaveProperty('parent', components);
    expect(sessionParam).toHaveProperty('in', 'cookie');
    expect(sessionParam).toHaveProperty('name', 'session');
  });

  test('deleteParameter', () => {
    components.deleteParameter('ID');

    expect(components.parameters.size).toBe(3);

    expect(Array.from(components.parameters.keys())).toStrictEqual([
      'Offset',
      'Language',
      'SessionID',
    ]);
  });

  test('clearParameters', () => {
    components.clearParameters();

    expect(components.parameters.size).toBe(0);
  });
});

describe('examples', () => {
  beforeEach(() => {
    components.setExample('Success');
    components.setExample('Error');
  });

  test('setExample', () => {
    expect(components.examples.size).toBe(2);
    expect(components.examples.get('Success')).toHaveProperty('parent', components);
    expect(components.examples.get('Error')).toHaveProperty('parent', components);
  });

  test('deleteExample', () => {
    components.deleteExample('Success');

    expect(components.examples.size).toBe(1);
    expect(components.examples.get('Error')).toBeTruthy();
  });

  test('clearExamples', () => {
    components.clearExamples();

    expect(components.examples.size).toBe(0);
  });
});

describe('requestBodies', () => {
  beforeEach(() => {
    components.setRequestBody('Empty');
    components.setRequestBody('List');
  });

  test('setRequestBody', () => {
    expect(components.requestBodies.size).toBe(2);
    expect(components.requestBodies.get('Empty')).toHaveProperty('parent', components);
    expect(components.requestBodies.get('List')).toHaveProperty('parent', components);
  });

  test('deleteRequestBody', () => {
    components.deleteRequestBody('Empty');

    expect(components.requestBodies.size).toBe(1);
    expect(components.requestBodies.get('List')).toBeTruthy();
  });

  test('clearRequestBodies', () => {
    components.clearRequestBodies();

    expect(components.requestBodies.size).toBe(0);
  });
});

describe('headers', () => {
  beforeEach(() => {
    components.setHeader('X-Language');
    components.setHeader('X-Fresha');
  });

  test('setHeader', () => {
    expect(components.headers.size).toBe(2);
    expect(components.headers.get('X-Language')).toHaveProperty('parent', components);
    expect(components.headers.get('X-Fresha')).toHaveProperty('parent', components);
  });

  test('deleteHeader', () => {
    components.deleteHeader('X-Language');

    expect(components.headers.size).toBe(1);
    expect(components.headers.get('X-Fresha')).toBeTruthy();
  });

  test('clearHeaders', () => {
    components.clearHeaders();

    expect(components.headers.size).toBe(0);
  });
});

describe('securitySchemes', () => {
  beforeEach(() => {
    components.setSecuritySchema('local', 'apiKey');
    components.setSecuritySchema('google', 'oauth2');
  });

  test('setSecuritySchema', () => {
    expect(components.securitySchemes.size).toBe(2);
    expect(components.securitySchemes.get('local')).toHaveProperty('parent', components);
    expect(components.securitySchemes.get('google')).toHaveProperty('parent', components);
  });

  test('deleteSecuritySchema', () => {
    components.deleteSecuritySchema('local');

    expect(components.securitySchemes.size).toBe(1);
    expect(components.securitySchemes.get('google')).toBeTruthy();
    expect(components.securitySchemes.get('google')).toHaveProperty('type', 'oauth2');
  });

  test('clearsecuritySchemes', () => {
    components.clearSecuritySchemes();

    expect(components.securitySchemes.size).toBe(0);
  });
});

describe('links', () => {
  beforeEach(() => {
    components.setLink('Language');
    components.setLink('Fresha');
  });

  test('setLink', () => {
    expect(components.links.size).toBe(2);
    expect(components.links.get('Language')).toHaveProperty('parent', components);
    expect(components.links.get('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteLink', () => {
    components.deleteLink('Language');

    expect(components.links.size).toBe(1);
    expect(components.links.get('Fresha')).toBeTruthy();
  });

  test('clearLinks', () => {
    components.clearLinks();

    expect(components.links.size).toBe(0);
  });
});

describe('callbacks', () => {
  beforeEach(() => {
    components.setCallback('Language');
    components.setCallback('Fresha');
  });

  test('setCallback', () => {
    expect(components.callbacks.size).toBe(2);
    expect(components.callbacks.get('Language')).toHaveProperty('parent', components);
    expect(components.callbacks.get('Fresha')).toHaveProperty('parent', components);
  });

  test('deleteCallback', () => {
    components.deleteCallback('Language');

    expect(components.callbacks.size).toBe(1);
    expect(components.callbacks.get('Fresha')).toBeTruthy();
  });

  test('clearCallbacks', () => {
    components.clearCallbacks();

    expect(components.callbacks.size).toBe(0);
  });
});
