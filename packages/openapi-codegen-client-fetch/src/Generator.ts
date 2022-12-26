import path from 'path';

import { Generator as GeneratorBase, getOperations } from '@fresha/openapi-codegen-utils';
import { SourceFile, ts } from 'ts-morph';

import { ActionFunc, NamedType, IndexFile, UtilsFile } from './parts';

import type { Context } from './context';

export class Generator extends GeneratorBase<Context> {
  readonly context: Context;
  protected readonly sourceFile: SourceFile;
  protected readonly actionFuncs: Map<string, ActionFunc>;
  protected readonly namedTypes: Map<string, NamedType>;
  protected readonly indexFile: IndexFile;
  protected readonly utilsFile: UtilsFile;

  constructor(context: Context) {
    super(context);
    this.context = context;
    this.sourceFile = this.context.project.createSourceFile(
      path.join(this.context.outputPath, 'src', 'actions.ts'),
      '',
      { overwrite: true },
    );
    this.actionFuncs = new Map<string, ActionFunc>();
    this.namedTypes = new Map<string, NamedType>();
    this.indexFile = new IndexFile(this.context);
    this.utilsFile = new UtilsFile(this.context);
  }

  collectData(): void {
    for (const operation of getOperations(this.context.openapi)) {
      const actionFunc = new ActionFunc({
        ...this.context,
        sourceFile: this.sourceFile,
        operation,
      });
      actionFunc.collectData(this.namedTypes);
      this.actionFuncs.set(actionFunc.name, actionFunc);
    }
    this.utilsFile.collectData();
  }

  generateCode(): void {
    const generatedTypes = new Set<string>();

    for (const actionFunc of this.actionFuncs.values()) {
      actionFunc.generateCode(generatedTypes);
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

    if (!this.context.dryRun) {
      this.context.project.saveSync();
    }
  }
}
