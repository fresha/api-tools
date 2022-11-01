import { Test, TestingModule } from '@nestjs/testing';
import { WebController } from './web.controller';
import { WebService } from './web.service';

describe('WebController', () => {
  let webController: WebController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WebController],
      providers: [WebService],
    }).compile();

    webController = app.get<WebController>(WebController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(webController.getHello()).toBe('Hello World!');
    });
  });
});
