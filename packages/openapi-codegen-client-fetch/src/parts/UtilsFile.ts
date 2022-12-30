import path from 'path';

import { Context } from '../context';

import type { SourceFile } from 'ts-morph';

export class UtilsFile {
  readonly context: Context;
  readonly sourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'utils.ts'),
      '',
      { overwrite: true },
    );
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    this.sourceFile.insertText(
      0,
      `
      import assert from 'assert';

      import type { JSONValue } from '@fresha/api-tools-core';

      let rootUrl = '';

      export type InitParams = {
        rootUrl: string;
      };

      export const init = (params: InitParams): void => {
        assert(params.rootUrl, 'Expected rootUrl to be a non-empty string');
        rootUrl = params.rootUrl;
      };

      export const makeUrl = (url: string): URL => {
        assert(rootUrl, 'Root URL is not set');
        return new URL(url, rootUrl);
      };

      let authCookieName = '';
      let authCookie = '';

      export const setAuthCookie = (name: string, value: string): void => {
        assert(name, "Expected cookie name to be a non-empty string");
        assert(value, "Expected cookie value to be a non-empty string");
        authCookieName = name;
        authCookie = value;
      };

      export const authorizeRequest = (request: RequestInit): void => {
        assert(authCookieName && authCookie, "Authorization cookie is not set");
        if (typeof window !== "undefined") {
          request.credentials = "include";
        } else {
          request.headers = {
            ...request.headers,
            cookie: \`\${authCookieName}=\${authCookie};\`,
          };
        }
      };

      export const toString = (val: unknown): string => {
        return String(val);
      };

      export const COMMON_HEADERS = {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      };

      class APIError extends Error {
        readonly original?: unknown;

        constructor(message: string, original?: unknown) {
          super(message);
          this.original = original;
        }
      }

      export const makeCall = async (url: URL, request: RequestInit): Promise<JSONValue> => {
        let result: Response;

        try {
          result = await fetch(url.toString(), request);
        } catch (err) {
          throw new APIError(\`Error calling \${url.toString()}\`, err);
        }

        if (!result.ok) {
          throw new APIError('Request failed', result);
        }

        let json: unknown;
        try {
          json = await result.json();
        } catch (err) {
          throw new APIError(\`Cannot parse JSON response for \${url.toString()}\`, err);
        }

        return json as JSONValue;
      };
    `,
    );
  }
}
