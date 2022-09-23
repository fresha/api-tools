import type { SchemaObject } from '../index';
import type { ObjectOrRef } from '@fresha/api-tools-core';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/kafka#version
 */
export type KafkaBindingVersionString = '0.2.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/kafka#server-binding-object
 */
export type KafkaServerBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/kafka#channel-binding-object
 */
export type KafkaChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/kafka#operation-binding-object
 */
export type KafkaOperationBindingObject = {
  groupId?: SchemaObject;
  clientId?: SchemaObject;
  bindingVersion?: KafkaBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/kafka#message-binding-object
 */
export type KafkaMessageBindingObject = {
  key?: ObjectOrRef<SchemaObject>;
  bindingVersion?: KafkaBindingVersionString;
};
