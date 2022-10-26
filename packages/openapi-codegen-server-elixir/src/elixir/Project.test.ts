import { Project } from './Project';

const makeProject = () => {
  return new Project({ rootDir: '/', appName: 'users_web', useInMemoryFileSystem: true });
};

let project = makeProject();

beforeEach(() => {
  project = makeProject();
});

test('getRouterFilePath', () => {
  expect(project.getRouterFilePath()).toBe('/lib/users_web/router.ex');
});

test.each`
  name                                        | path
  ${'AuthController'}                         | ${'/lib/users_web/controllers/auth_controller.ex'}
  ${'UsersWeb.Internal.Admin.AuthController'} | ${'/lib/users_web/controllers/internal/admin/auth_controller.ex'}
`('path for controller $name should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getControllerFilePath(name)).toBe(path);
});

test.each`
  name                                            | path
  ${'AuthControllerTest'}                         | ${'/test/users_web/controllers/auth_controller_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthControllerTest'} | ${'/test/users_web/controllers/internal/admin/auth_controller_test.exs'}
`('path for controller $name tests should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getControllerTestFilePath(name)).toBe(path);
});

test.each`
  name                                  | path
  ${'AuthView'}                         | ${'/lib/users_web/views/auth_view.ex'}
  ${'UsersWeb.Internal.Admin.AuthView'} | ${'/lib/users_web/views/internal/admin/auth_view.ex'}
`('path for view $name should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getViewFilePath(name)).toBe(path);
});

test.each`
  name                                      | path
  ${'AuthViewTest'}                         | ${'/test/users_web/views/auth_view_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthViewTest'} | ${'/test/users_web/views/internal/admin/auth_view_test.exs'}
`('path for view $name tests should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getViewTestFilePath(name)).toBe(path);
});

test.each`
  name                                      | path
  ${'AuthResource'}                         | ${'/lib/users_web/resources/auth_resource.ex'}
  ${'UsersWeb.Internal.Admin.AuthResource'} | ${'/lib/users_web/resources/internal/admin/auth_resource.ex'}
`('path for resource $name should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getResourceFilePath(name)).toBe(path);
});

test.each`
  name                                          | path
  ${'AuthResourceTest'}                         | ${'/test/users_web/resources/auth_resource_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthResourceTest'} | ${'/test/users_web/resources/internal/admin/auth_resource_test.exs'}
`('path for view $name tests should be $path', ({ name, path }: { name: string, path: string }) => {
  expect(project.getResourceTestFilePath(name)).toBe(path);
});
