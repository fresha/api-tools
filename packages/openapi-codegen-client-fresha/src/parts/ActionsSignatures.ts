import assert from 'assert';

import { camelCase } from '@fresha/api-tools-core';

import { getOperationEntryKeyOrThrow, getOperationIdOrThrow } from '../utils/openapi';
import { addTypeAlias, addVariableStatement } from '../utils/tsMorph';

import { ActionSignature } from './ActionSignature';
import { findOperationTemplate } from './operations';

import type { Generator } from '../Generator';
import type { Logger } from '../utils/logging';
import type { SourceFile } from 'ts-morph';

const titleCase = (str: string): string => {
  const res = camelCase(str);
  return res[0].toUpperCase() + res.slice(1);
};

export class ActionsSignatures {
  readonly parent: Generator;
  readonly logger: Logger;
  readonly tsSourceFile: SourceFile;
  readonly name: string;
  protected readonly actions: Map<string, ActionSignature>;

  constructor(parent: Generator) {
    this.parent = parent;
    this.logger = this.parent.logger;
    this.tsSourceFile = this.parent.tsSourceFile;
    this.name = titleCase(`${this.parent.apiName.replace('-api', '')}Actions`);
    this.actions = new Map<string, ActionSignature>();
  }

  collectData(): void {
    for (const [pathUrl, pathItem] of this.parent.openapi.paths) {
      for (const [operationKey, operation] of pathItem.operations()) {
        const entryKey = getOperationEntryKeyOrThrow(operation);
        const { template } = findOperationTemplate(
          operationKey,
          pathUrl,
          entryKey,
          getOperationIdOrThrow(operation),
        );
        const actionName = template.actionName(entryKey);
        assert(!this.actions.has(actionName));
        this.actions.set(actionName, new ActionSignature(this, operation, template));
      }
    }
  }

  generateCode(): void {
    this.logger.info(`Generating actions shape type, ${this.name}`);

    const returnTypeObj = addTypeAlias(this.tsSourceFile, this.name, '{}', true);
    for (const action of this.actions.values()) {
      action.generateCode(returnTypeObj);
    }

    addVariableStatement(
      this.tsSourceFile,
      `!${camelCase(this.parent.apiName)}`,
      `boundActions(store, configuredApi) as ${this.name}`,
    );
  }
}
