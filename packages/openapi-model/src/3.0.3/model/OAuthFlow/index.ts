import type { OAuthAuthorisationCodeFlow } from './OAuthAuthorisationCodeFlow';
import type { OAuthClientCredentialsFlow } from './OAuthClientCredentialsFlow';
import type { OAuthImplicitFlow } from './OAuthImplicitFlow';
import type { OAuthPasswordFlow } from './OAuthPasswordFlow';

export type OAuthFlow =
  | OAuthAuthorisationCodeFlow
  | OAuthClientCredentialsFlow
  | OAuthPasswordFlow
  | OAuthImplicitFlow;

export type { OAuthFlowType, OAuthFlowParent } from './OAuthFlowBase';

export { OAuthFlows, OAuthFlowsParent } from './OAuthFlows';
