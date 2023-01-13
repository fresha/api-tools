import * as audienceValue from './audienceValue';
import * as contactProperties from './contactProperties';
import * as identifierMustBeAnUuid from './identifierMustBeAnUuid';
import * as identifierMustBeUnique from './identifierMustBeUnique';

import type { Rule } from '../types';

import * as sharedSchemaTitle from './sharedSchemaTitles';
import * as sortPathItem from './sortPathItem';
import * as sortSharedSchema from './sortSharedSchema';
import * as versionIsSemver from './versionIsSemver';

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
