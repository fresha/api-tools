import type { JSONArray } from '@fresha/api-tools-core';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/solace#version
 */
export type SolaceBindingVersionString = '0.2.0' | 'latest';

/**
 * @see https://github.com/asyncapi/bindings/tree/master/solace#server-binding-object
 */
export type SolaceServerBindingObject = {
  bindingVersion?: SolaceBindingVersionString;
  msgVpn?: string;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/solace#channel-binding-object
 */
export type SolaceChannelBindingObject = Record<string, never>;

/**
 * @see https://github.com/asyncapi/bindings/tree/master/solace#operation-binding-object
 */
export type SolaceOperationBindingObject = {
  bindingVersion?: SolaceBindingVersionString;
  destinations?: JSONArray;
};

/**
 * @see https://github.com/asyncapi/bindings/tree/master/solace#message-binding-object
 */
export type SolaceMessageBindingObject = Record<string, never>;
