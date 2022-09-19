import type { ApiKeyScheme } from './ApiKeyScheme';
import type { HttpScheme } from './HttpScheme';
import type { OAuth2Scheme } from './OAuth2Scheme';
import type { OpenIdConnectScheme } from './OpenIdConnectScheme';
import type { SecuritySchemeParent } from './SecuritySchemeBase';

export type SecurityScheme = ApiKeyScheme | HttpScheme | OAuth2Scheme | OpenIdConnectScheme;

export type { SecuritySchemeParent };
