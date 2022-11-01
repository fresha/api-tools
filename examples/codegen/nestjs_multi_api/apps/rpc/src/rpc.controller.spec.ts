import { Test, TestingModule } from '@nestjs/testing';
import { RpcController } from './rpc.controller';
import { RpcService } from './rpc.service';

describe('RpcController', () => {
  let rpcController: RpcController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RpcController],
      providers: [RpcService],
    }).compile();

    rpcController = app.get<RpcController>(RpcController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(rpcController.getHello()).toBe('Hello World!');
    });
  });
});
