/**
 * @see https://github.com/asyncapi/bindings/tree/master/jms#version
 */
export type JMSBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/jms#server-binding-object
 */
export type JMSServerBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/jms#channel-binding-object
 */
export type JMSChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/jms#operation-binding-object
 */
export type JMSOperationBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/jms#message-binding-object
 */
export type JMSMessageBindingObject = Record<string, never>;
