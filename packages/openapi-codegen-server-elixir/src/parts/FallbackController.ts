import type { Context } from '../context';
import type { SourceFile } from '@fresha/code-morph-ex';
import type { PathItemModel } from '@fresha/openapi-model/build/3.0.3';

export class FallbackController {
  readonly context: Context;
  readonly moduleName: string;
  readonly sourceFile: SourceFile;

  constructor(context: Context, moduleName: string) {
    this.context = context;
    this.moduleName = moduleName;
    this.sourceFile = this.context.project.createControllerFile(this.moduleName);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  collectData(_pathItem: PathItemModel): void {}

  generateCode(): void {
    this.context.logger.info(`Generating code for the controller: "${this.moduleName}"`);

    this.sourceFile.writeDefmodule(this.moduleName, () => {
      this.sourceFile.writeUse(this.context.project.getAppModuleName(), ':controller');
      this.sourceFile.writeAlias(`${this.context.project.getAppModuleName()}.ErrorView`);

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :bad_request}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:bad_request)',
            '|> put_view(ErrorView)',
            '|> render(:"400")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :bad_request, code}'],
        guards: ['is_atom(code)'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:bad_request)',
            '|> put_view(ErrorView)',
            '|> render(:"400", code: Atom.to_string(code))',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :invalid_parameters, params}'],
        guards: ['is_list(params)'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:bad_request)',
            '|> put_view(ErrorView)',
            '|> render(:"400", params: params)',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :invalid_pointers, pointers}'],
        guards: ['is_list(pointers)'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:bad_request)',
            '|> put_view(ErrorView)',
            '|> render(:"400", pointers: pointers)',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :unauthorized}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:unauthorized)',
            '|> put_view(ErrorView)',
            '|> render(:"401")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :forbidden}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:forbidden)',
            '|> put_view(ErrorView)',
            '|> render(:"403")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :not_found}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:not_found)',
            '|> put_view(ErrorView)',
            '|> render(:"404")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, %Ecto.Changeset{} = changeset}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:unprocessable_entity)',
            '|> put_view(ErrorView)',
            '|> render(:"422", changeset: changeset)',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :validation_failed}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:unprocessable_entity)',
            '|> put_view(ErrorView)',
            '|> render(:"422")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :unprocessable_entity}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:unprocessable_entity)',
            '|> put_view(ErrorView)',
            '|> render(:"422")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :conflict}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:conflict)',
            '|> put_view(ErrorView)',
            '|> render(:"409")',
          );
        },
      });

      this.sourceFile.writeFunction({
        name: 'call',
        params: ['conn', '{:error, :not_available}'],
        content: () => {
          this.sourceFile.writeLines(
            'conn',
            '|> put_status(:service_unavailable)',
            '|> put_view(ErrorView)',
            '|> render(:"503")',
          );
        },
      });
    });
  }
}
