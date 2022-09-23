import type {
  AMQPChannelBindingObject,
  AMQPMessageBindingObject,
  AMQPOperationBindingObject,
  AMQPServerBindingObject,
} from './bindings/amqp';
import type {
  AMQP1ChannelBindingObject,
  AMQP1MessageBindingObject,
  AMQP1OperationBindingObject,
  AMQP1ServerBindingObject,
} from './bindings/amqp1';
import type {
  AnypointMQChannelBindingObject,
  AnypointMQMessageBindingObject,
  AnypointMQOperationBindingObject,
  AnypointMQServerBindingObject,
} from './bindings/anypointmq';
import type {
  HTTPChannelBindingObject,
  HTTPMessageBindingObject,
  HTTPOperationBindingObject,
  HTTPServerBindingObject,
} from './bindings/http';
import type {
  IBMMQChannelBindingObject,
  IBMMQMessageBindingObject,
  IBMMQOperationBindingObject,
  IBMMQServerBindingObject,
} from './bindings/ibmmq';
import type {
  JMSChannelBindingObject,
  JMSMessageBindingObject,
  JMSOperationBindingObject,
  JMSServerBindingObject,
} from './bindings/jms';
import type {
  KafkaChannelBindingObject,
  KafkaMessageBindingObject,
  KafkaOperationBindingObject,
  KafkaServerBindingObject,
} from './bindings/kafka';
import type {
  MercureChannelBindingObject,
  MercureMessageBindingObject,
  MercureOperationBindingObject,
  MercureServerBindingObject,
} from './bindings/mercure';
import type {
  MQTTChannelBindingObject,
  MQTTMessageBindingObject,
  MQTTOperationBindingObject,
  MQTTServerBindingObject,
} from './bindings/mqtt';
import type {
  MQTT5ChannelBindingObject,
  MQTT5MessageBindingObject,
  MQTT5OperationBindingObject,
  MQTT5ServerBindingObject,
} from './bindings/mqtt5';
import type {
  NATSChannelBindingObject,
  NATSMessageBindingObject,
  NATSOperationBindingObject,
  NATSServerBindingObject,
} from './bindings/nats';
import type {
  RedisChannelBindingObject,
  RedisMessageBindingObject,
  RedisOperationBindingObject,
  RedisServerBindingObject,
} from './bindings/redis';
import type {
  SNSChannelBindingObject,
  SNSMessageBindingObject,
  SNSOperationBindingObject,
  SNSServerBindingObject,
} from './bindings/sns';
import type {
  SolaceChannelBindingObject,
  SolaceMessageBindingObject,
  SolaceOperationBindingObject,
  SolaceServerBindingObject,
} from './bindings/solace';
import type {
  SQSChannelBindingObject,
  SQSMessageBindingObject,
  SQSOperationBindingObject,
  SQSServerBindingObject,
} from './bindings/sqs';
import type {
  STOMPChannelBindingObject,
  STOMPMessageBindingObject,
  STOMPOperationBindingObject,
  STOMPServerBindingObject,
} from './bindings/stomp';
import type {
  WebSocketChannelBindingObject,
  WebSocketMessageBindingObject,
  WebSocketOperationBindingObject,
  WebSocketServerBindingObject,
} from './bindings/ws';
import type {
  CommonMarkString,
  EmailString,
  JSONObject,
  JSONValue,
  MIMETypeString,
  ObjectOrRef,
  URLString,
} from '@fresha/api-tools-core';

export type Identifier = string;

export type AsyncAPIVersionString = '2.5.0';

export type URITemplateString = string;

export type SchemaType = 'boolean' | 'number' | 'integer' | 'string' | 'object' | 'array';

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#schemaObject
 */
export type SchemaObject = {
  title?: string;
  type?: SchemaType;
  required?: string[];
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  maxProperties?: number;
  minProperties?: number;
  enum?: JSONValue[];
  const?: boolean;
  examples?: JSONValue;
  readOnly?: boolean;
  writeOnly?: boolean;
  properties?: Record<string, SchemaObject>;
  patternProperties?: Record<string, SchemaObject>;
  additionalProperties?: SchemaObject | boolean;
  additionalItems?: SchemaObject | boolean;
  items?: SchemaObject;
  propertyNames?: string[];
  allOf?: SchemaObject[];
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  not?: SchemaObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#specificationExtensions
 */
export type SpecificationExtensions = Record<`x-${string}`, JSONValue>;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#A2SObject
 */
export type AsyncAPIObject = {
  asyncapi: AsyncAPIVersionString;
  id: Identifier;
  info: InfoObject;
  servers?: Record<string, ObjectOrRef<ServerObject>[]>;
  defaultContentType: MIMETypeString;
  channels: ChannelsObject;
  components?: ComponentsObject;
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
};

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#infoObject
 */
export type InfoObject = {
  title: string;
  version: string;
  description?: CommonMarkString;
  termsOfService?: URLString;
  contact?: ContactObject;
  license?: LicenseObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#contactObject
 */
export type ContactObject = {
  name?: string;
  url?: URLString;
  email?: EmailString;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#licenseObject
 */
export type LicenseObject = {
  name: string;
  url?: URLString;
} & SpecificationExtensions;

export type ServerProtocol =
  | 'amqp'
  | 'amqps'
  | 'http'
  | 'https'
  | 'ibmmq'
  | 'jms'
  | 'kafka'
  | 'kafka-secure'
  | 'anypointmq'
  | 'mqtt'
  | 'secure-mqtt'
  | 'solace'
  | 'stomp'
  | 'stomps'
  | 'ws'
  | 'wss'
  | 'mercure';

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#serverObject
 */
export type ServerObject = {
  url: URLString;
  protocol: ServerProtocol;
  protocolVersion?: string;
  description?: CommonMarkString;
  variables?: Record<string, ServerVariableObject>;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  bindings?: ObjectOrRef<ServerBindingsObject>;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#serverVariableObject
 */
export type ServerVariableObject = {
  enum?: string[];
  default?: string;
  description?: CommonMarkString;
  examples?: string[];
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#securityRequirementObject
 */
export type SecurityRequirementObject = Record<string, string[]>;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#tagsObject
 */
export type TagObject = {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#externalDocumentationObject
 */
export type ExternalDocumentationObject = {
  description?: CommonMarkString;
  url: URLString;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#serverBindingsObject
 */
export type ServerBindingsObject = {
  http?: HTTPServerBindingObject;
  ws?: WebSocketServerBindingObject;
  kafka?: KafkaServerBindingObject;
  anypointmq?: AnypointMQServerBindingObject;
  amqp?: AMQPServerBindingObject;
  amqp1?: AMQP1ServerBindingObject;
  mqtt?: MQTTServerBindingObject;
  mqtt5: MQTT5ServerBindingObject;
  nats?: NATSServerBindingObject;
  jms?: JMSServerBindingObject;
  sns?: SNSServerBindingObject;
  solace?: SolaceServerBindingObject;
  sqs?: SQSServerBindingObject;
  stomp?: STOMPServerBindingObject;
  redis?: RedisServerBindingObject;
  mercure?: MercureServerBindingObject;
  ibmmq?: IBMMQServerBindingObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#channelsObject
 */
export type ChannelsObject = Record<URITemplateString, ObjectOrRef<ChannelItemObject>>;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#channelItemObject
 */
export type ChannelItemObject = {
  description?: CommonMarkString;
  servers?: string[];
  subscribe?: OperationObject;
  publish?: OperationObject;
  parameters?: ParametersObject;
  bindings?: ObjectOrRef<ChannelBindingsObject>;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#parametersObject
 */
export type ParametersObject = Record<string, ObjectOrRef<ParameterObject>>;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#parameterObject
 */
export type ParameterObject = {
  description?: CommonMarkString;
  schema?: ObjectOrRef<SchemaObject>;
  location?: string;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#channelBindingsObject
 */
export type ChannelBindingsObject = {
  http?: HTTPChannelBindingObject;
  ws?: WebSocketChannelBindingObject;
  kafka?: KafkaChannelBindingObject;
  anypointmq?: AnypointMQChannelBindingObject;
  amqp?: AMQPChannelBindingObject;
  amqp1?: AMQP1ChannelBindingObject;
  mqtt?: MQTTChannelBindingObject;
  mqtt5: MQTT5ChannelBindingObject;
  nats?: NATSChannelBindingObject;
  jms?: JMSChannelBindingObject;
  sns?: SNSChannelBindingObject;
  solace?: SolaceChannelBindingObject;
  sqs?: SQSChannelBindingObject;
  stomp?: STOMPChannelBindingObject;
  redis?: RedisChannelBindingObject;
  mercure?: MercureChannelBindingObject;
  ibmmq?: IBMMQChannelBindingObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.4.0#operationObject
 */
export type OperationObject = {
  operationId?: string;
  summary?: string;
  description?: CommonMarkString;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: ObjectOrRef<OperationBindingsObject>;
  traits?: ObjectOrRef<OperationTraitObject>[];
  message?: ObjectOrRef<MessageObject> | { oneOf: ObjectOrRef<MessageObject>[] };
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#operationBindingsObject
 */
export type OperationBindingsObject = {
  http?: HTTPOperationBindingObject;
  ws?: WebSocketOperationBindingObject;
  kafka?: KafkaOperationBindingObject;
  anypointmq?: AnypointMQOperationBindingObject;
  amqp?: AMQPOperationBindingObject;
  amqp1?: AMQP1OperationBindingObject;
  mqtt?: MQTTOperationBindingObject;
  mqtt5: MQTT5OperationBindingObject;
  nats?: NATSOperationBindingObject;
  jms?: JMSOperationBindingObject;
  sns?: SNSOperationBindingObject;
  solace?: SolaceOperationBindingObject;
  sqs?: SQSOperationBindingObject;
  stomp?: STOMPOperationBindingObject;
  redis?: RedisOperationBindingObject;
  mercure?: MercureOperationBindingObject;
  ibmmq?: IBMMQOperationBindingObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#operationTraitObject
 */
export type OperationTraitObject = {
  operationId?: string;
  summary?: string;
  description?: CommonMarkString;
  security?: SecurityRequirementObject[];
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: ObjectOrRef<OperationBindingsObject>;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#messageObject
 */
export type MessageObject = {
  messageId?: string;
  headers?: ObjectOrRef<SchemaObject>;
  payload?: JSONValue;
  correlationId?: ObjectOrRef<CorrelationIDObject>;
  schemaFormat?: string;
  contentType?: MIMETypeString;
  name?: string;
  title?: string;
  summary?: string;
  description?: CommonMarkString;
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: MessageBindingsObject;
  examples?: MessageExampleObject[];
  traits?: ObjectOrRef<MessageTraitObject>[];
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#correlationIdObject
 */
export type CorrelationIDObject = {
  description?: CommonMarkString;
  location: string;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#messageBindingsObject
 */
export type MessageBindingsObject = {
  http?: HTTPMessageBindingObject;
  ws?: WebSocketMessageBindingObject;
  kafka?: KafkaMessageBindingObject;
  anypointmq?: AnypointMQMessageBindingObject;
  amqp?: AMQPMessageBindingObject;
  amqp1?: AMQP1MessageBindingObject;
  mqtt?: MQTTMessageBindingObject;
  mqtt5: MQTT5MessageBindingObject;
  nats?: NATSMessageBindingObject;
  jms?: JMSMessageBindingObject;
  sns?: SNSMessageBindingObject;
  solace?: SolaceMessageBindingObject;
  sqs?: SQSMessageBindingObject;
  stomp?: STOMPMessageBindingObject;
  redis?: RedisMessageBindingObject;
  mercure?: MercureMessageBindingObject;
  ibmmq?: IBMMQMessageBindingObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#messageExampleObject
 */
export type MessageExampleObject = {
  headers?: JSONObject;
  payload?: JSONValue;
  name?: string;
  summary?: string;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#messageTraitObject
 */
export type MessageTraitObject = {
  messageId?: string;
  headers?: ObjectOrRef<SchemaObject>;
  correlationId?: ObjectOrRef<CorrelationIDObject>;
  schemaFormat?: string;
  contentType?: MIMETypeString;
  name?: string;
  title?: string;
  summary?: string;
  description?: CommonMarkString;
  tags?: TagObject[];
  externalDocs?: ExternalDocumentationObject;
  bindings?: MessageBindingsObject;
  examples?: MessageExampleObject[];
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#componentsObject
 */
export type ComponentsObject = {
  schemas?: Record<string, ObjectOrRef<SchemaObject>>;
  servers?: Record<string, ObjectOrRef<ServerObject>>;
  serverVariables?: Record<string, ObjectOrRef<ServerVariableObject>>;
  channels?: Record<string, ObjectOrRef<ChannelItemObject>>;
  messages?: Record<string, ObjectOrRef<MessageObject>>;
  securitySchemes?: Record<string, ObjectOrRef<SecuritySchemeObject>>;
  parameters?: Record<string, ObjectOrRef<ParameterObject>>;
  correlationIds?: Record<string, ObjectOrRef<CorrelationIDObject>>;
  operationTraits?: Record<string, ObjectOrRef<OperationTraitObject>>;
  messageTraits?: Record<string, ObjectOrRef<MessageTraitObject>>;
  serverBindings?: Record<string, ObjectOrRef<ServerBindingsObject>>;
  channelBindings?: Record<string, ObjectOrRef<ChannelBindingsObject>>;
  operationBindings?: Record<string, ObjectOrRef<OperationBindingsObject>>;
  messageBindings?: Record<string, ObjectOrRef<MessageBindingsObject>>;
};

export type SecuritySchemeType =
  | 'userPassword'
  | 'apiKey'
  | 'X509'
  | 'symmetricEncryption'
  | 'asymmetricEncryption'
  | 'httpApiKey'
  | 'http'
  | 'oauth2'
  | 'openIdConnect'
  | 'plain'
  | 'scramSha256'
  | 'scramSha512'
  | 'gssapi';

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#securitySchemeObject
 */
export type SecuritySchemeObject = {
  type: SecuritySchemeType;
  description?: CommonMarkString;
  name?: string;
  in?: 'user' | 'password' | 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#oauthFlowsObject
 */
export type OAuthFlowsObject = {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
} & SpecificationExtensions;

/**
 * @see https://www.asyncapi.com/docs/reference/specification/v2.5.0-next-spec.3#oauthFlowObject
 */
export type OAuthFlowObject = {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes?: Record<string, string>;
} & SpecificationExtensions;
