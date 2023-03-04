import { APIKeySecurityScheme } from './APIKeySecurityScheme';
import { HTTPSecurityScheme } from './HTTPSecurityScheme';
import { OAuth2SecurityScheme } from './OAuth2SecurityScheme';
import { OpenIdConnectSecurityScheme } from './OpenIdConnectSecurityScheme';

export type SecuritySchema =
  | APIKeySecurityScheme
  | HTTPSecurityScheme
  | OAuth2SecurityScheme
  | OpenIdConnectSecurityScheme;

export {
  APIKeySecurityScheme,
  HTTPSecurityScheme,
  OAuth2SecurityScheme,
  OpenIdConnectSecurityScheme,
};
