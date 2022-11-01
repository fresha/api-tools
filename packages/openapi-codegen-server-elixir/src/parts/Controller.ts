import assert from 'assert';

import { Action } from './Action';

import type { Context } from './types';
import type { SourceFile } from '@fresha/ex-morph';
import type {
  OperationModel,
  PathItemModel,
  PathItemOperationKey,
} from '@fresha/openapi-model/build/3.0.3';

const actionNameFromOperationKey = (
  operationKey: PathItemOperationKey,
  operation: OperationModel,
): string => {
  switch (operationKey) {
    case 'get':
      return operation.getParameter('id', 'path') ? 'show' : 'index';
    case 'post':
      return 'create';
    case 'put':
    case 'patch':
      return 'update';
    case 'delete':
      return 'delete';
    default:
      assert.fail(`Unsupported method ${operationKey}`);
  }
  return '';
};

export class Controller {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;
  protected readonly actions: Map<string, Action>;

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createControllerFile(moduleName);
    this.actions = new Map<string, Action>();
  }

  actionEntries(): IterableIterator<[string, Action]> {
    return this.actions.entries();
  }

  collectData(pathItem: PathItemModel): void {
    this.context.logger.info(`Collecting data for the controller: "${this.moduleName}"`);

    for (const [operationKey, operation] of pathItem.operations()) {
      const actionName = actionNameFromOperationKey(operationKey, operation);
      assert(!this.actions.has(actionName));
      const action = new Action(this.context, this.sourceFile, actionName, operationKey, operation);
      this.actions.set(actionName, action);
    }
  }

  generateCode(): void {
    this.context.logger.info(`Generating code of the controller: "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getAppModuleName(), ':controller');
      this.sourceFile.newLine();
      this.sourceFile.writeFunctionCall(
        'action_fallback',
        this.context.project.getControllerModuleName('fallback'),
      );
      this.sourceFile.newLine();
      this.sourceFile.writeLine('# add aliases here');

      for (const action of this.actions.values()) {
        action.generateCode();
      }

      for (const action of this.actions.values()) {
        if (action.needsDateTimeParser) {
          this.generateNaiveDateTimeParsers();
          break;
        }
      }
    });
  }

  protected generateNaiveDateTimeParsers(): void {
    this.sourceFile.newLine();
    this.sourceFile.writeLine('defp naive_date_time(nil), do: {:error, :invalid_date_time}');
    this.sourceFile.newLine();
    this.sourceFile.writeLine('defp naive_date_time(input) do');
    this.sourceFile.writeIndented(() => {
      this.sourceFile.writeLine('case NaiveDateTime.from_iso8601(input) do');
      this.sourceFile.writeIndentedLines(
        '{:ok, date_time} -> {:ok, date_time}',
        '{:error, _} -> {:error, :invalid_date_time}',
      );
      this.sourceFile.writeLine('end');
    });
    this.sourceFile.writeLine('end');
  }
}
