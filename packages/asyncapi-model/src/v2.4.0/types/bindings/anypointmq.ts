import type { SchemaObject } from '../index';
import type { JSONValue, URLString } from '@fresha/api-tools-core';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/anypointmq#versions
 */
export type AnypointMQBindingVersionString = '0.0.1' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/anypointmq#server-binding-object
 */
export type AnypointMQServerBindingObject = {
  protocol: 'anypointmq';
  url: URLString;
  protocolVersion?: string;
  security: JSONValue;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/anypointmq#channel-binding-object
 */
export type AnypointMQChannelBindingObject = {
  destination?: string;
  destinationType?: 'exchange' | 'queue' | 'fifo-queue';
  bindingVersion?: AnypointMQBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/anypointmq#operation-binding-object
 */
export type AnypointMQOperationBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/anypointmq#message-binding-object
 */
export type AnypointMQMessageBindingObject = {
  headers?: SchemaObject;
  bindingVersion: AnypointMQBindingVersionString;
};
