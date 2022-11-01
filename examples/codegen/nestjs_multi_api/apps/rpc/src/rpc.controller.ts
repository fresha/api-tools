import { Controller, Get } from '@nestjs/common';
import { RpcService } from './rpc.service';

@Controller()
export class RpcController {
  constructor(private readonly rpcService: RpcService) {}

  @Get()
  getHello(): string {
    return this.rpcService.getHello();
  }
}
