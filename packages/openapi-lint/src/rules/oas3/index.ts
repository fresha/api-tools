import * as duplicateTags from './duplicateTags';
import * as infoProperties from './infoProperties';
import * as noServerUrlTrailingSlash from './noServerUrlTrailingSlash';
import * as noUnusedSharedComponents from './noUnusedSharedComponents';
import * as operationMustHaveUniqueId from './operationMustHaveUniqueId';
import * as operationMustDefineSuccessResponses from './operationSuccessResponse';
import * as operationTagsDefined from './operationTagsDefined';
import * as operationParamsMustBeUnique from './operationUniqueParams';
import * as parameterDescription from './parameterDescription';
import * as serverList from './serverList';
import * as tagsDescriptions from './tagsDescriptions';

import type { Rule } from '../types';

export const preset: Rule[] = [
  infoProperties,
  operationMustHaveUniqueId,
  operationMustDefineSuccessResponses,
  operationParamsMustBeUnique,
  noUnusedSharedComponents,
  serverList,
  noServerUrlTrailingSlash,
  parameterDescription,
  operationTagsDefined,
  tagsDescriptions,
  duplicateTags,
];
