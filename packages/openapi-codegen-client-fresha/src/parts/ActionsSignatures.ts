import assert from 'assert';

import { camelCase, titleCase } from '@fresha/api-tools-core';
import { addConstant, addTypeLiteralAlias } from '@fresha/code-morph-ts';
import {
  getOperationEntryKeyOrThrow,
  getOperationId,
  getOperations,
} from '@fresha/openapi-codegen-utils';

import { ActionSignature } from './ActionSignature';
import { findOperationTemplate } from './operations';

import type { Context } from '../context';
import type { SourceFile } from 'ts-morph';

/**
 * Generates the type alias, containing signatures of all API actions.
 * For each action, delegates the task of generating its signature to ActionSignature part.
 *
 * @see ActionSignature
 */
export class ActionsSignatures {
  readonly context: Context;
  readonly sourceFile: SourceFile;
  readonly name: string;
  protected readonly actions: Map<string, ActionSignature>;

  constructor(context: Context, sourceFile: SourceFile) {
    this.context = context;
    this.sourceFile = sourceFile;
    this.name = titleCase(`${this.context.apiName.replace('-api', '')}Actions`);
    this.actions = new Map<string, ActionSignature>();
  }

  collectData(): void {
    for (const operation of getOperations(this.context.openapi)) {
      const entryKey = getOperationEntryKeyOrThrow(operation);
      const { template } = findOperationTemplate(
        operation.httpMethod,
        operation.parent.pathUrl,
        entryKey,
        getOperationId(operation),
      );
      const actionName = getOperationId(operation) ?? template.actionName(entryKey);
      assert(!this.actions.has(actionName));
      this.actions.set(
        actionName,
        new ActionSignature(this.context, actionName, operation, template),
      );
    }
  }

  generateCode(): void {
    this.context.logger.info(`Generating actions shape type, ${this.name}`);

    const returnTypeObj = addTypeLiteralAlias(this.sourceFile, this.name, true);
    for (const action of this.actions.values()) {
      action.generateCode(returnTypeObj);
    }

    addConstant(
      this.sourceFile,
      camelCase(this.context.apiName),
      `boundActions(store, configuredApi) as ${this.name}`,
      true,
    );
  }
}
