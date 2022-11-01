import { Module } from '@nestjs/common';
import { WebController } from './web.controller';
import { WebService } from './web.service';

@Module({
  imports: [],
  controllers: [WebController],
  providers: [WebService],
})
export class WebModule {}
