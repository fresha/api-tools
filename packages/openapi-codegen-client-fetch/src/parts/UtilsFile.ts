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
      import type { JSONValue } from '@fresha/api-tools-core';

      export type APIClientErrorKind = 'config' | 'network' | 'logic';

      export class APIClientError extends Error {
        readonly kind: APIClientErrorKind;
        readonly original?: unknown;

        constructor(kind: APIClientErrorKind, message: string, original?: unknown) {
          super(message);
          this.kind = kind;
          this.original = original;
        }
      }

      export type FetchFunc = (url: string, init: RequestInit) => Promise<Response>;

      export type SuccessCallbackFunc = (actionName: string, params: unknown, response: JSONValue) => void;

      let rootUrl = '';
      let fetcher: FetchFunc = global.fetch;
      let successCallback: SuccessCallbackFunc | null = null;

      export type InitParams = {
        rootUrl: string;
        fetcher?: FetchFunc;
        successCallback?: SuccessCallbackFunc;
      };

      export const init = (params: InitParams): void => {
        if (!params.rootUrl) {
          throw new APIClientError('config', 'Expected rootUrl to be a non-empty string');
        }
        rootUrl = params.rootUrl;
        if (params.fetcher) {
          fetcher = params.fetcher;
        }
        if (params.successCallback) {
          successCallback = params.successCallback;
        }
      };

      export const makeUrl = (url: string): URL => {
        if (!rootUrl) {
          throw new APIClientError('config', 'Root URL is not set');
        }
        return new URL(url, rootUrl);
      };

      let authCookieName = '';
      let authCookie = '';

      export const setAuthCookie = (name: string, value: string): void => {
        if (!name || !value) {
          throw new APIClientError('config', 'Expected cookie name and value to be non-empty');
        }
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
        if (typeof window !== "undefined") {
          request.credentials = "include";
        } else {
          const finalAuthCookieName = extraParams?.authCookieName || authCookieName;
          const finalAuthCookie = extraParams?.authCookie || authCookie;
          if (!finalAuthCookieName || !finalAuthCookie) {
            throw new APIClientError('config', 'Authorization cookie is not set');
          }
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

      export const addQueryParam = (url: URL, name: string, param: unknown): void => {
        if (param !== undefined) {
          url.searchParams.set(name, String(param));
        }
      };

      export const COMMON_HEADERS: Record<string, string> = {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      };

      export const callApi = async (url: URL, request: RequestInit): Promise<Response> => {
        if (!fetcher) {
          throw new APIClientError('config', 'Fetch function is not set');
        }

        let result: Response;

        try {
          result = await fetcher(url.toString(), request);
        } catch (err) {
          throw new APIClientError('network', \`Error calling \${url.toString()}\`, err);
        }

        if (!result.ok) {
          throw new APIClientError('logic', 'Request failed', result);
        }

        return result;
      };

      export const callJsonApi = async (url: URL, request: RequestInit): Promise<JSONValue> => {
        const result = await callApi(url, request);

        let json: unknown;
        try {
          json = await result.json();
        } catch (err) {
          throw new APIClientError('logic', \`Cannot parse JSON response for \${url.toString()}\`, err);
        }

        return json as JSONValue;
      };

      export const dispatchSuccess = (actionName: string, params: unknown, response: JSONValue): void => {
        if (successCallback) {
          successCallback(actionName, params, response);
        }
      };
    `,
    );
  }
}
