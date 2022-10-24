import { createLogger } from '@fresha/openapi-codegen-utils';
import { OpenAPIFactory, OpenAPIModel } from '@fresha/openapi-model/build/3.0.3';
import { Project } from 'ts-morph';

import { ActionsSignatures } from './ActionsSignatures';

import type { Generator } from './Generator';

import '@fresha/jest-config';

const makeActionsSignatures = (openapi: OpenAPIModel): ActionsSignatures => {
  const logger = createLogger(false);
  const tsProject = new Project({ useInMemoryFileSystem: true });
  const tsSourceFile = tsProject.createSourceFile('index.ts', '');

  const actionsSignatures = new ActionsSignatures({
    options: {
      useJsonApi: true,
    },
    apiName: 'testApi',
    openapi,
    logger,
    tsSourceFile,
  } as Generator);

  return actionsSignatures;
};

test('list actions', () => {
  const openapi = OpenAPIFactory.create('test-api', '0.1.0');

  const operationNoParams = openapi.setPathItem('/employees').setOperation('get');
  operationNoParams.operationId = 'readEmployeeListNoParams';
  operationNoParams.setExtension('entry-key', 'employee');

  const operationQueryParams = openapi.setPathItem('/tasks').setOperation('get');
  operationQueryParams.setExtension('entry-key', 'task');

  const actionsSignatures = makeActionsSignatures(openapi);
  actionsSignatures.collectData();
  actionsSignatures.generateCode();

  expect(actionsSignatures.tsSourceFile).toHaveFormattedText(`
    export type TestApiActions = {
      readEmployeeListNoParams: () => Promise<Response>;
      readTaskList: () => Promise<Response>;
    };

    export const testApi = boundActions(store, configuredApi) as TestApiActions;
  `);
});
