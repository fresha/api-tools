import type { Context } from '../context';
import type { Controller } from './Controller';
import type { SourceFile } from '@fresha/code-morph-ex';

export class ErrorView {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createViewFile(moduleName);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  collectData(_controller: Controller): void {}

  generateCode(): void {
    this.context.logger.info(`Generating code for the view "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getAppModuleName(), ':view');
      this.sourceFile.writeUse('Jabbax.Document');

      this.sourceFile.writeFunction({
        name: 'template_not_found',
        params: ['template', '_assigns'],
        content: () => {
          this.sourceFile.writeLines(
            'error_code =',
            '  template',
            '  |> Phoenix.Controller.status_message_from_template()',
            '  |> String.downcase()',
            '  |> String.replace(" ", "_")',
          );
          this.sourceFile.newLine();
          this.sourceFile.writeLines(
            '%Document{',
            '  errors: [',
            '    %Error{code: error_code}',
            '  ]',
            '}',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"400.json-api"', '%{params: params}'],
        content: () => {
          this.sourceFile.writeLines(
            '%Document{',
            '  errors:',
            '    Enum.map(params, fn {code, parameter} ->',
            '      %Error{',
            '        code: code,',
            '        source: %ErrorSource{',
            '          parameter: parameter',
            '        }',
            '      }',
            '    end)',
            '}',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"400.json-api"', '%{pointers: pointers}'],
        content: () => {
          this.sourceFile.writeLines(
            '%Document{',
            '  errors:',
            '    Enum.map(pointers, fn {code, pointer} ->',
            '      %Error{',
            '        code: code,',
            '        source: %ErrorSource{',
            '          pointer: pointer',
            '        }',
            '      }',
            '    end)',
            '}',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"400.json-api"', '_'],
        content: () => {
          this.sourceFile.writeLine(
            '%Document{errors: [%Error{code: "400", title: "Bad request"}]}',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"404.json-api"', '_'],
        content: () => {
          this.sourceFile.writeLine('%Document{errors: [%Error{code: "404", title: "Not found"}]}');
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"422.json-api"', '%{reason: reason}'],
        content: () => {
          this.sourceFile.writeLine(
            '%Document{errors: [%Error{code: "422", title: "Unprocessable entity", detail: reason}]}',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'render',
        params: ['"422.json-api"', '%{changeset: changeset}'],
        content: () => {
          this.sourceFile.writeLine('Surgex.Changeset.build_errors_document(changeset)');
        },
      });
    });
  }
}
