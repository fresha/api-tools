import type { Context } from '../context';
import type { SourceFile } from 'ts-morph';

export class UtilsFile {
  readonly context: Context;
  readonly sourceFile: SourceFile;

  constructor(context: Context) {
    this.context = context;
    this.sourceFile = this.context.createSourceFile('src/utils.ts');
  }

  // eslint-disable-next-line class-methods-use-this
  collectData(): void {}

  generateCode(): void {
    this.sourceFile.insertText(
      0,
      `
      import assert from 'assert';

      import type { JSONValue } from '@fresha/api-tools-core';

      export type FetchFunc = (url: string, init: RequestInit) => Promise<Response>;

      let rootUrl = '';
      let fetcher: FetchFunc = global.fetch;

      export type InitParams = {
        rootUrl: string;
        fetcher?: FetchFunc;
      };

      export const init = (params: InitParams): void => {
        assert(params.rootUrl, 'Expected rootUrl to be a non-empty string');
        rootUrl = params.rootUrl;
        if (params.fetcher) {
          fetcher = params.fetcher;
        }
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

      export type ExtraCallParams = {
        authCookieName?: string;
        authCookie?: string;
        xForwardedFor?: string;
        xForwardedHost?: string;
        xForwardedProto?: string;
      };

      export const authorizeRequest = (request: RequestInit, extraParams?: ExtraCallParams): void => {
        const finalAuthCookieName = extraParams?.authCookieName || authCookieName;
        const finalAuthCookie = extraParams?.authCookie || authCookie;
        assert(finalAuthCookieName && finalAuthCookie, "Authorization cookie is not set");
        if (typeof window !== "undefined") {
          request.credentials = "include";
        } else {
          request.headers = {
            ...request.headers,
            cookie: \`\${finalAuthCookieName}=\${finalAuthCookie};\`,
          };
        }
      };

      export const applyExtraParams = (request: RequestInit, extraParams?: ExtraCallParams): void => {
        if (extraParams?.xForwardedFor || extraParams?.xForwardedHost || extraParams?.xForwardedProto) {
          const headers = {
            ...request.headers
          } as Record<string, string>;
          if (extraParams.xForwardedFor) {
            headers['X-Forwarded-For'] = extraParams.xForwardedFor;
          }
          if (extraParams.xForwardedHost) {
            headers['X-Forwarded-Host'] = extraParams.xForwardedHost;
          }
          if (extraParams.xForwardedProto) {
            headers['X-Forwarded-Proto'] = extraParams.xForwardedProto;
          }
          request.headers = headers;
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

      export const callApi = async (url: URL, request: RequestInit): Promise<Response> => {
        assert(fetcher, 'Fetch function is not set');

        let result: Response;

        try {
          result = await fetcher(url.toString(), request);
        } catch (err) {
          throw new APIError(\`Error calling \${url.toString()}\`, err);
        }

        if (!result.ok) {
          throw new APIError('Request failed', result);
        }

        return result;
      };

      export const callJsonApi = async (url: URL, request: RequestInit): Promise<JSONValue> => {
        const result = await callApi(url, request);

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
