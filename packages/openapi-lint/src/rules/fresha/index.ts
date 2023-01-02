import * as audienceValue from './audienceValue';
import * as contactProperties from './contactProperties';
import * as identifierMustBeAnUuid from './identifierMustBeAnUuid';
import * as identifierMustBeUnique from './identifierMustBeUnique';
import * as sharedSchemaTitle from './sharedSchemaTitles';
import * as sortPathItem from './sortPathItem';
import * as sortSharedSchema from './sortSharedSchema';
import * as versionIsSemver from './versionIsSemver';

import type { Rule } from '../types';

export const preset: Rule[] = [
  audienceValue,
  contactProperties,
  identifierMustBeAnUuid,
  identifierMustBeUnique,
  sharedSchemaTitle,
  sortPathItem,
  sortSharedSchema,
  versionIsSemver,
];
