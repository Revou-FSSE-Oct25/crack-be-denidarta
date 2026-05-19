import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  statusCode: number;
  [key: string]: unknown;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<unknown>> {
    const statusCode = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map((data) => {
        const base = { success: true, statusCode, message: 'OK' };
        if (
          data &&
          typeof data === 'object' &&
          'data' in data
        ) {
          return { ...base, ...(data as object) };
        }
        return { ...base, data: data ?? undefined };
      }),
    );
  }
}
