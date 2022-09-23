/**
 * @see https://github.com/asyncapi/bindings/tree/master/nats#version
 */
export type NATSBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/nats#server-binding-object
 */
export type NATSServerBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/nats#channel-binding-object
 */
export type NATSChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/nats#operation-binding-object
 */
export type NATSOperationBindingObject = {
  queue?: string;
  bindingVersion?: NATSBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/nats#message-binding-object
 */
export type NATSMessageBindingObject = Record<string, never>;
