import type { SchemaObject } from '../index';
import type { HTTPMethod } from '@fresha/api-tools-core';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/http#version
 */
export type HTTPBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/http#server-binding-object
 */
export type HTTPServerBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/http#channel-binding-object
 */
export type HTTPChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/http#operation-binding-object
 */
export type HTTPOperationBindingObject = {
  query?: SchemaObject;
  bindingVersion?: HTTPBindingVersionString;
} & (
  | {
      type: 'request';
      method: HTTPMethod;
    }
  | {
      type: 'response';
    }
);

/**
 * @see https://github.com/asyncapi/bindings/tree/master/http#message-binding-object
 */
export type HTTPMessageBindingObject = {
  headers?: SchemaObject;
  bindingVersion?: HTTPBindingVersionString;
};
