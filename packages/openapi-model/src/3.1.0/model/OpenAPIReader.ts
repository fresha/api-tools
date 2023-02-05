import { OpenAPI } from './OpenAPI';

export class OpenAPIReader {
  // eslint-disable-next-line class-methods-use-this
  parse(): OpenAPI {
    const result = new OpenAPI('la', 'la');
    return result;
  }
}
