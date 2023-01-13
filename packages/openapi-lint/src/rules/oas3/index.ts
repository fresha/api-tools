import * as duplicateTags from './duplicateTags';
import * as infoProperties from './infoProperties';
import * as noServerUrlTrailingSlash from './noServerUrlTrailingSlash';
import * as noUnusedSharedComponents from './noUnusedSharedComponents';

import type { Rule } from '../types';

import * as operationMustHaveUniqueId from './operationMustHaveUniqueId';
import * as operationMustDefineSuccessResponses from './operationSuccessResponse';
import * as operationTagsDefined from './operationTagsDefined';
import * as operationParamsMustBeUnique from './operationUniqueParams';
import * as parameterDescription from './parameterDescription';
import * as serverList from './serverList';
import * as tagsDescriptions from './tagsDescriptions';

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
