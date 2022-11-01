import { NestFactory } from '@nestjs/core';
import { RpcModule } from './rpc.module';

async function bootstrap() {
  const app = await NestFactory.create(RpcModule);
  await app.listen(3000);
}
bootstrap();
