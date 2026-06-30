import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Düğün Davetiye API Çalışıyor!';
  }
}
