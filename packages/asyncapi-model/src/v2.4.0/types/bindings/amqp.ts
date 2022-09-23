/**
 * @see https://github.com/asyncapi/bindings/tree/master/amqp#version
 */
export type AMQPBindingVersionString = '0.2.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/amqp#server-binding-object
 */
export type AMQPServerBindingObject = Record<string, never>;

export type AMQPChannelBindingExchangeObject = {
  name?: string;
  type?: 'topic' | 'direct' | 'fanout' | 'default' | 'headers';
  durable?: boolean;
  autoDelete?: boolean;
  vhost?: string;
};

export type AMQPChannelBindingQueueObject = {
  name?: string;
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  vhost?: string;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/amqp#channel-binding-object
 */
export type AMQPChannelBindingObject = {
  is?: 'queue' | 'routingKey';
  exchange?: Record<string, AMQPChannelBindingExchangeObject>;
  queue?: Record<string, AMQPChannelBindingQueueObject>;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/amqp#operation-binding-object
 */
export type AMQPOperationBindingObject = {
  expiration?: number;
  userId?: string;
  cc?: string[];
  priority?: number;
  deliveryMode?: 1 | 2;
  replyTo?: string[];
  timestamp?: boolean;
  bindingVersion?: AMQPBindingVersionString;
} & (
  | {
      mandatory?: boolean;
      bcc?: string[];
    }
  | {
      ack?: boolean;
    }
);

/**
 * @see https://github.com/asyncapi/bindings/tree/master/amqp#message-binding-object
 */
export type AMQPMessageBindingObject = {
  contentEncoding?: string;
  messageType?: string;
  bindingVersion?: AMQPBindingVersionString;
};
