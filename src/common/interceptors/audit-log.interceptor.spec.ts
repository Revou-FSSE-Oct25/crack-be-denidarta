import { AuditLogInterceptor } from './audit-log.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';

function makeContext(method: string, path: string, userId?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        path,
        headers: { 'x-request-id': 'test-id' },
        user: userId ? { sub: userId } : undefined,
      }),
      getResponse: () => ({ statusCode: 200 }),
    }),
  } as unknown as ExecutionContext;
}

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    interceptor = new AuditLogInterceptor();
    logSpy = jest
      .spyOn((interceptor as unknown as { logger: { log: () => void } }).logger, 'log')
      .mockImplementation(() => {});
  });

  it('logs POST requests with user and request id', async () => {
    const ctx = makeContext('POST', '/api/v1/submissions', 'user-123');
    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of({ id: '1' }) }));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('user-123'));
  });

  it('does not log GET requests', async () => {
    const ctx = makeContext('GET', '/api/v1/submissions');
    await lastValueFrom(interceptor.intercept(ctx, { handle: () => of([]) }));
    expect(logSpy).not.toHaveBeenCalled();
  });
});
