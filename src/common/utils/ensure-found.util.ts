import { NotFoundException } from '@nestjs/common';

export function ensureFound<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value == null) {
    throw new NotFoundException(message);
  }
  return value;
}
