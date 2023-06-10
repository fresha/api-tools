import * as duplicateTags from './duplicateTags';
import * as infoProperties from './infoProperties';
import * as noServerUrlTrailingSlash from './noServerUrlTrailingSlash';
import * as noUnusedSharedComponents from './noUnusedSharedComponents';
import * as operationMustHaveUniqueId from './operationMustHaveUniqueId';
import * as operationMustDefineSuccessResponses from './operationSuccessResponse';
import * as operationTags from './operationTags';
import * as operationTagsDefined from './operationTagsDefined';
import * as operationParamsMustBeUnique from './operationUniqueParams';
import * as parameterDescription from './parameterDescription';
import * as serverList from './serverList';
import * as tagsDescriptions from './tagsDescriptions';

import type { RuleModule } from '../types';

export const id = 'openapi';

export const rules: RuleModule[] = [
  infoProperties,
  operationMustHaveUniqueId,
  operationMustDefineSuccessResponses,
  operationParamsMustBeUnique,
  noUnusedSharedComponents,
  serverList,
  noServerUrlTrailingSlash,
  parameterDescription,
  operationTags,
  operationTagsDefined,
  tagsDescriptions,
  duplicateTags,
];
