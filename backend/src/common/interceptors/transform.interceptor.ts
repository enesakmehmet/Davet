import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // Eğer response zaten formatlanmışsa, olduğu gibi döndür
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Değilse standart formata çevir
        const response = context.switchToHttp().getResponse();
        return {
          statusCode: response.statusCode,
          message: 'İşlem başarılı',
          data,
        };
      }),
    );
  }
}
