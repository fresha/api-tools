import { APIKeySecuritySchema } from './APIKeySecuritySchema';
import { HTTPSecuritySchema } from './HTTPSecuritySchema';
import { MutualTLSSecuritySchema } from './MutualTLSSecuritySchema';
import { OAuth2SecuritySchema } from './OAuth2SecuritySchema';
import { OpenIDConnectSecuritySchema } from './OpenIDConnectSecuritySchema';

export type SecuritySchema =
  | APIKeySecuritySchema
  | HTTPSecuritySchema
  | MutualTLSSecuritySchema
  | OAuth2SecuritySchema
  | OpenIDConnectSecuritySchema;

export {
  APIKeySecuritySchema,
  HTTPSecuritySchema,
  MutualTLSSecuritySchema,
  OAuth2SecuritySchema,
  OpenIDConnectSecuritySchema,
};
