import { OpenAPIFactory } from '@fresha/openapi-model/build/3.0.3';
import { Controller } from './Controller';
import { Generator } from './Generator';

test('happy path', () => {
  const openapi = OpenAPIFactory.create();
  const pathItem = openapi.setPathItem('/employees');

  const readEmployeeList = pathItem.setOperation('get');
  readEmployeeList.operationId =

  const controller = new Controller({} as Generator);

  controller.collectData('/employees', );
});
