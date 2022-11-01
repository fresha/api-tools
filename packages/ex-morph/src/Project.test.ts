import { Project } from './Project';

const makeProject = () => {
  return new Project({ rootDir: '/', phoenixApp: 'users_web', useInMemoryFileSystem: true });
};

let project = makeProject();

beforeEach(() => {
  project = makeProject();
});

describe('getSourceFile', () => {
  test('does not exist before call', () => {
    expect(project.getSourceFile('/youwontfindme.txt')).toBeUndefined();

    const sourceFile = project.createSourceFile('/youwontfindme.txt');

    expect(sourceFile.isDirty()).toBeTruthy();

    sourceFile.saveSync();

    expect(project.getSourceFile('/youwontfindme.txt')).toBe(sourceFile);
    expect(sourceFile.isDirty()).toBeFalsy();
    expect(project.getFS().existsSync('/youwontfindme.txt')).toBeTruthy();
  });

  test('exists before call', () => {
    const filePath = 'abcd.txt';

    project.getFS().writeFileSync(filePath, '?!_');

    const sourceFile = project.getSourceFile(filePath);
    expect(sourceFile?.getText()).toBe('?!_');
  });
});

test('getRouterFilePath', () => {
  expect(project.getRouterFilePath()).toBe('/lib/users_web/router.ex');
});

test.each`
  name                                        | path
  ${'AuthController'}                         | ${'/lib/users_web/controllers/auth_controller.ex'}
  ${'UsersWeb.Internal.Admin.AuthController'} | ${'/lib/users_web/controllers/internal/admin/auth_controller.ex'}
`('path for controller $name should be $path', ({ name, path }: { name: string; path: string }) => {
  expect(project.getControllerFilePath(name)).toBe(path);
});

test('controller files', () => {
  const controllerName = 'AuthController';
  expect(() => project.getControllerFileOrThrow(controllerName)).toThrow();
  const controllerFile = project.createSourceFile(project.getControllerFilePath(controllerName));
  expect(project.getControllerFile(controllerName)).toBe(controllerFile);
  expect(project.getControllerFileOrThrow(controllerName)).toBe(controllerFile);
});

test.each`
  name                                            | path
  ${'AuthControllerTest'}                         | ${'/test/users_web/controllers/auth_controller_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthControllerTest'} | ${'/test/users_web/controllers/internal/admin/auth_controller_test.exs'}
`(
  'path for controller $name tests should be $path',
  ({ name, path }: { name: string; path: string }) => {
    expect(project.getControllerTestFilePath(name)).toBe(path);
  },
);

test('controller test files', () => {
  const controllerName = 'X.Y.Z.ControllerTest';
  expect(() => project.getControllerTestFileOrThrow(controllerName)).toThrow();
  const controllerTestFile = project.createSourceFile(
    project.getControllerTestFilePath(controllerName),
  );
  expect(project.getControllerTestFile(controllerName)).toBe(controllerTestFile);
  expect(project.getControllerTestFileOrThrow(controllerName)).toBe(controllerTestFile);
});

test.each`
  name                                  | path
  ${'AuthView'}                         | ${'/lib/users_web/views/auth_view.ex'}
  ${'UsersWeb.Internal.Admin.AuthView'} | ${'/lib/users_web/views/internal/admin/auth_view.ex'}
`('path for view $name should be $path', ({ name, path }: { name: string; path: string }) => {
  expect(project.getViewFilePath(name)).toBe(path);
});

test('view files', () => {
  const viewName = 'A.B.CView';
  expect(() => project.getViewFileOrThrow(viewName)).toThrow();
  const viewFile = project.createSourceFile(project.getViewFilePath(viewName));
  expect(project.getViewFile(viewName)).toBe(viewFile);
  expect(project.getViewFileOrThrow(viewName)).toBe(viewFile);
});

test.each`
  name                                      | path
  ${'AuthViewTest'}                         | ${'/test/users_web/views/auth_view_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthViewTest'} | ${'/test/users_web/views/internal/admin/auth_view_test.exs'}
`('path for view $name tests should be $path', ({ name, path }: { name: string; path: string }) => {
  expect(project.getViewTestFilePath(name)).toBe(path);
});

test('view test files', () => {
  const viewName = 'A.B.CViewTest';
  expect(() => project.getViewTestFileOrThrow(viewName)).toThrow();
  const viewFile = project.createSourceFile(project.getViewTestFilePath(viewName));
  expect(project.getViewTestFile(viewName)).toBe(viewFile);
  expect(project.getViewTestFileOrThrow(viewName)).toBe(viewFile);
});

test.each`
  name                                      | path
  ${'AuthResource'}                         | ${'/lib/users_web/resources/auth_resource.ex'}
  ${'UsersWeb.Internal.Admin.AuthResource'} | ${'/lib/users_web/resources/internal/admin/auth_resource.ex'}
`('path for resource $name should be $path', ({ name, path }: { name: string; path: string }) => {
  expect(project.getResourceFilePath(name)).toBe(path);
});

test('resource files', () => {
  const resourceName = 'A.B.UserResource';
  expect(() => project.getResourceFileOrThrow(resourceName)).toThrow();
  const resourceFile = project.createSourceFile(project.getResourceFilePath(resourceName));
  expect(project.getResourceFile(resourceName)).toBe(resourceFile);
  expect(project.getResourceFileOrThrow(resourceName)).toBe(resourceFile);
});

test('getResourceModuleName', () => {
  expect(project.getResourceModuleName('customers')).toBe('UsersWeb.CustomersResource');
  expect(project.getResourceModuleName('customer-stats')).toBe('UsersWeb.CustomerStatsResource');
});

test.each`
  name                                          | path
  ${'AuthResourceTest'}                         | ${'/test/users_web/resources/auth_resource_test.exs'}
  ${'UsersWeb.Internal.Admin.AuthResourceTest'} | ${'/test/users_web/resources/internal/admin/auth_resource_test.exs'}
`(
  'path for resource $name tests should be $path',
  ({ name, path }: { name: string; path: string }) => {
    expect(project.getResourceTestFilePath(name)).toBe(path);
  },
);

test('resource test files', () => {
  const resourceName = 'A.B.UserResourceTest';
  expect(() => project.getResourceTestFileOrThrow(resourceName)).toThrow();
  const resourceTestFile = project.createSourceFile(project.getResourceTestFilePath(resourceName));
  expect(project.getResourceTestFile(resourceName)).toBe(resourceTestFile);
  expect(project.getResourceTestFileOrThrow(resourceName)).toBe(resourceTestFile);
});
