/**
 * @see https://github.com/asyncapi/bindings/tree/master/mqtt#version
 */
export type MQTTBindingVersionString = '0.1.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/mqtt#server-binding-object
 */
export type MQTTServerBindingObject = {
  clientId: string;
  cleanSession: boolean;
  lastWill: {
    topic: string;
    qos: number;
    message: string;
    retain: boolean;
  };
  keepAlive: number;
  bindingVersion?: MQTTBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/mqtt#channel-binding-object
 */
export type MQTTChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/mqtt#operation-binding-object
 */
export type MQTTOperationBindingObject = {
  qos?: number;
  retain?: boolean;
  bindingVersion?: MQTTBindingVersionString;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/mqtt#message-binding-object
 */
export type MQTTMessageBindingObject = {
  bindingVersion?: MQTTBindingVersionString;
};
