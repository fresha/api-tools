import { createTestContext } from '../testHelpers';

import { Router } from './Router';

import type { Action } from './Action';
import type { Controller } from './Controller';

test('no paths', () => {
  const context = createTestContext('api_tools_router_web');

  const router = new Router(context);
  router.generateCode();

  const { calls } = (context.console.log as jest.Mock).mock;
  expect(calls).toHaveLength(1);

  expect((calls as string[][])[0][0]).toMatchSnapshot();
});

test('multiple controllers and actions', () => {
  const context = createTestContext('api_tools_router_web');

  const router = new Router(context);

  router.collectData({
    urlExp: '/users',
    moduleName: 'ApiToolsRouterWeb.UsersController',
    moduleAlias: 'UsersController',
    actionEntries(): IterableIterator<[string, Action]> {
      const actions = new Map<string, Action>([
        [
          'index',
          {
            getName() {
              return 'index';
            },
          } as Action,
        ],
        [
          'show',
          {
            getName() {
              return 'show';
            },
          } as Action,
        ],
      ]);
      return actions.entries();
    },
  } as Controller);

  router.collectData({
    urlExp: '/users',
    moduleName: 'ApiToolsRouterWeb.TasksController',
    moduleAlias: 'TasksController',
    actionEntries(): IterableIterator<[string, Action]> {
      const actions = new Map<string, Action>([
        [
          'delete',
          {
            getName() {
              return 'delete';
            },
          } as Action,
        ],
        [
          'create',
          {
            getName() {
              return 'create';
            },
          } as Action,
        ],
      ]);
      return actions.entries();
    },
  } as Controller);

  router.generateCode();

  const { calls } = (context.console.log as jest.Mock).mock;
  expect(calls).toHaveLength(1);

  expect((calls as string[][])[0][0]).toMatchSnapshot();
});
