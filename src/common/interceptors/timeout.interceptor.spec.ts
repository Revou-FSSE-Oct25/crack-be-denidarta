import { TimeoutInterceptor } from './timeout.interceptor';
import { ExecutionContext, RequestTimeoutException } from '@nestjs/common';
import { of, delay } from 'rxjs';
import { lastValueFrom } from 'rxjs';

const mockContext = {} as ExecutionContext;

function makeHandler(ms: number) {
  return { handle: () => of('ok').pipe(delay(ms)) };
}

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();
  });

  it('passes through fast responses', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(mockContext, makeHandler(0)),
    );
    expect(result).toBe('ok');
  });

  it('throws RequestTimeoutException when handler exceeds 10s', async () => {
    jest.useFakeTimers();
    const obs = interceptor.intercept(mockContext, makeHandler(20_000));
    const promise = lastValueFrom(obs);
    jest.advanceTimersByTime(11_000);
    await expect(promise).rejects.toThrow(RequestTimeoutException);
    jest.useRealTimers();
  });
});
