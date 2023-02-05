import { SecuritySchemaBase } from './SecuritySchemaBase';

import type { MutualTLSSecuritySchemaModel } from '../types';

export class MutualTLSSecuritySchema
  extends SecuritySchemaBase
  implements MutualTLSSecuritySchemaModel
{
  // eslint-disable-next-line class-methods-use-this
  get type(): 'mutualTLS' {
    return 'mutualTLS';
  }
}
