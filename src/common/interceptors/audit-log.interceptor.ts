import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      path: string;
      headers: Record<string, string>;
      user?: { sub?: string };
    }>();

    if (!MUTATING_METHODS.has(req.method)) return next.handle();

    const start = Date.now();
    const requestId = req.headers['x-request-id'] ?? 'unknown';
    const userId = req.user?.sub ?? 'anonymous';

    return next.handle().pipe(
      tap(() => {
        const res = context
          .switchToHttp()
          .getResponse<{ statusCode: number }>();
        this.logger.log(
          `[${requestId}] ${req.method} ${req.path} userId=${userId} status=${res.statusCode} duration=${Date.now() - start}ms`,
        );
      }),
    );
  }
}
