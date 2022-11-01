import { Injectable } from '@nestjs/common';

@Injectable()
export class WebService {
  getHello(): string {
    return 'Hello World!';
  }
}
