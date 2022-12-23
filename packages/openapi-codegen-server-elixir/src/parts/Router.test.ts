import { poorMansElixirFormat } from '@fresha/code-morph-test-utils';

import { makeContext } from '../testHelpers';

import { Router } from './Router';

import type { Action } from './Action';
import type { Controller } from './Controller';

test('no paths', () => {
  const context = makeContext('api_tools_router_web');

  const router = new Router(context);
  router.generateCode();

  const { calls } = (context.console.log as jest.Mock).mock;
  expect(calls).toHaveLength(1);
  expect(poorMansElixirFormat((calls as string[][])[0][0])).toBe(
    poorMansElixirFormat(`
    #
    # ROUTER
    # In your router file, add the following lines
    #
    scope "/api", ApiToolsRouterWeb do
      pipe_through :api

    end
  `),
  );
});

test('multiple controllers and actions', () => {
  const context = makeContext('api_tools_router_web');

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
  expect(poorMansElixirFormat((calls as string[][])[0][0])).toBe(
    poorMansElixirFormat(`
    #
    # ROUTER
    # In your router file, add the following lines
    #
    scope "/api", ApiToolsRouterWeb do
      pipe_through :api

      resources("/users", UsersController, only: [:index, :show])
      resources("/users", TasksController, only: [:delete, :create])
    end
  `),
  );
});
