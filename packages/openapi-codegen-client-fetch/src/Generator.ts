import { Generator as GeneratorBase, getOperations } from '@fresha/openapi-codegen-utils';
import { SourceFile, ts } from 'ts-morph';

import {
  ActionFunc,
  RequestFormatterFunc,
  NamedType,
  DocumentType,
  IndexFile,
  UtilsFile,
} from './parts';

import type { Context } from './context';

export class Generator extends GeneratorBase<Context> {
  readonly context: Context;
  protected readonly sourceFile: SourceFile;
  protected readonly formattersFile: SourceFile;
  protected readonly typesFile: SourceFile;
  protected readonly actionFuncs: Map<string, ActionFunc>;
  protected readonly requestFormatterFuncs: Map<string, RequestFormatterFunc>;
  protected readonly namedTypes: Map<string, NamedType>;
  protected readonly indexFile: IndexFile;
  protected readonly utilsFile: UtilsFile;

  constructor(context: Context) {
    super(context);
    this.context = context;
    this.sourceFile = this.context.createSourceFile('src/actions.ts');
    this.formattersFile = this.context.createSourceFile('src/formatters.ts');
    this.typesFile = this.context.createSourceFile('src/types.ts');
    this.actionFuncs = new Map<string, ActionFunc>();
    this.requestFormatterFuncs = new Map<string, RequestFormatterFunc>();
    this.namedTypes = new Map<string, NamedType>();
    this.indexFile = new IndexFile(this.context);
    this.utilsFile = new UtilsFile(this.context);
  }

  collectData(): void {
    for (const operation of getOperations(this.context.openapi, {
      deprecated: this.context.includeDeprecated,
      internal: this.context.includeInternal,
      tags: Array.from(this.context.includedTags),
    })) {
      const actionFunc = new ActionFunc({
        ...this.context,
        sourceFile: this.sourceFile,
        formattersFile: this.formattersFile,
        typesFile: this.typesFile,
        operation,
      });
      actionFunc.collectData(this.namedTypes);
      this.actionFuncs.set(actionFunc.name, actionFunc);
    }
    if (this.context.withFormatters) {
      for (const namedType of this.namedTypes.values()) {
        if (namedType instanceof DocumentType && namedType.isRequestBody) {
          const requestFormatterFunc = new RequestFormatterFunc(namedType);
          requestFormatterFunc.collectData();
          this.requestFormatterFuncs.set(requestFormatterFunc.name, requestFormatterFunc);
        }
      }
    }
    this.utilsFile.collectData();
  }

  generateCode(): void {
    const generatedTypes = new Set<string>();
    for (const namedType of this.namedTypes.values()) {
      namedType.generateCode(generatedTypes);
    }

    for (const actionFunc of this.actionFuncs.values()) {
      actionFunc.generateCode();
    }
    if (this.context.withFormatters) {
      for (const requestFormatterFunc of this.requestFormatterFuncs.values()) {
        requestFormatterFunc.generateCode();
      }
    }

    this.indexFile.generateCode();
    this.utilsFile.generateCode();

    for (const sourceFile of this.context.project.getSourceFiles()) {
      if (!sourceFile.isSaved()) {
        sourceFile.formatText({
          semicolons: ts.SemicolonPreference.Insert,
          indentSize: 2,
          convertTabsToSpaces: true,
          trimTrailingWhitespace: true,
          indentStyle: ts.IndentStyle.Smart,
        });
      }
    }

    if (!this.context.withFormatters) {
      this.context.project.removeSourceFile(this.formattersFile);
    }

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }
}
