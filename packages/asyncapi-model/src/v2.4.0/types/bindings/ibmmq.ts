/**
 * @see https://github.com/asyncapi/bindings/tree/master/ibmmq#version
 */
export type IBMMQBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/ibmmq#server-binding-object
 */
export type IBMMQServerBindingObject = {
  groupId?: string;
  ccdtQueueManagerName?: string;
  cipherSpec?: string;
  multiEndpointServer?: boolean;
  heartBeatInterval?: number;
  bindingVersion?: IBMMQBindingVersionString;
};

export type IBMMQChannelQueueProperties = {
  objectName: string;
  isPartitioned?: boolean;
  exclusive?: boolean;
};

export type IBMMQChannelTopicProperties = {
  string?: string;
  objectName?: string;
  durablePermitted?: boolean;
  lastMsgRetained?: boolean;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/ibmmq#channel-binding-object
 */
export type IBMMQChannelBindingObject = {
  destinationType?: 'topic' | 'queue';
  queue?: Record<string, IBMMQChannelQueueProperties>;
  topic?: Record<string, IBMMQChannelTopicProperties>;
  maxMsgLength?: number;
  bindingVersion?: IBMMQBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/ibmmq#operation-binding-object
 */
export type IBMMQOperationBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/ibmmq#message-binding-object
 */
export type IBMMQMessageBindingObject = {
  type?: 'string' | 'jms' | 'binary';
  headers?: string;
  description?: string;
  expiry?: number;
  bindingVersion?: IBMMQBindingVersionString;
};
