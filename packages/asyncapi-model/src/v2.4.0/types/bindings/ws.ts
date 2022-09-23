import type { SchemaObject } from '../index';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/websockets#version
 */
export type WebSocketBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/websockets#server-binding-object
 */
export type WebSocketServerBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/websockets#channel-binding-object
 */
export type WebSocketChannelBindingObject = {
  method?: 'GET' | 'POST';
  query?: SchemaObject;
  headers?: SchemaObject;
  bindingVersion?: WebSocketBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/websockets#operation-binding-object
 */
export type WebSocketOperationBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/websockets#message-binding-object
 */
export type WebSocketMessageBindingObject = Record<string, never>;
