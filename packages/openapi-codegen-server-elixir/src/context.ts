import { Project } from '@fresha/code-morph-ex';
import { createJSONAPISchemaRegistry, JSONAPISchemaRegistry } from '@fresha/json-api-model';
import {
  createContext as createBasicContext,
  Context as BasicContext,
} from '@fresha/openapi-codegen-utils';

export interface Context extends BasicContext {
  readonly testObjectFactoryModuleName: string;
  readonly project: Project;
  readonly registry: JSONAPISchemaRegistry;
}

export interface CreateContextParams {
  input: string;
  output: string;
  jsonApi?: boolean;
  verbose?: boolean;
  dryRun?: boolean;
  phoenixApp?: string;
  testFactoryModule?: string;
}

export const createContext = (args: CreateContextParams): Context => {
  const context = createBasicContext(args);

  const project = new Project({
    rootDir: args.output,
    phoenixApp: args.phoenixApp!,
    overwriteFiles: true,
  });

  return {
    ...context,
    testObjectFactoryModuleName: args.testFactoryModule!,
    project,
    registry: createJSONAPISchemaRegistry(),
  };
};
