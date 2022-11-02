import type { Project } from '@fresha/ex-morph';
import type { RegistryModel } from '@fresha/json-api-model';
import type { Logger } from '@fresha/openapi-codegen-utils';
import type { OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';

type ConsoleWriter = (arg: string) => void;

export interface Context {
  readonly outputPath: string;
  readonly useJsonApi: boolean;
  readonly testObjectFactoryModuleName: string;
  readonly dryRun: boolean;
  readonly openapi: OpenAPIModel;
  readonly project: Project;
  readonly registry: RegistryModel;
  readonly consoleWriter: ConsoleWriter;
  readonly logger: Logger;
}
