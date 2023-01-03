import nodeAssert from 'assert';

import type { OperationModel } from '@fresha/openapi-model/build/3.0.3';

export function assert(cond: unknown, message: string, operation: OperationModel): asserts cond {
  nodeAssert(
    cond,
    `${message}. Operation (${operation.httpMethod.toUpperCase()} '${operation.parent.pathUrl}')`,
  );
}
