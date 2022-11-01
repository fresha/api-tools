import { Module } from '@nestjs/common';
import { RpcController } from './rpc.controller';
import { RpcService } from './rpc.service';

@Module({
  imports: [],
  controllers: [RpcController],
  providers: [RpcService],
})
export class RpcModule {}
