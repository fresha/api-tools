import { Injectable } from '@nestjs/common';

@Injectable()
export class RpcService {
  getHello(): string {
    return 'Hello World!';
  }
}
