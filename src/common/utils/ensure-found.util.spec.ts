import { NotFoundException } from '@nestjs/common';
import { ensureFound } from './ensure-found.util';

describe('ensureFound', () => {
  it('returns value when not null', () => {
    expect(ensureFound({ id: '1' }, 'Not found')).toEqual({ id: '1' });
  });

  it('throws NotFoundException on null', () => {
    expect(() => ensureFound(null, 'Thing not found')).toThrow(
      NotFoundException,
    );
  });

  it('throws NotFoundException on undefined', () => {
    expect(() => ensureFound(undefined, 'Thing not found')).toThrow(
      NotFoundException,
    );
  });
});
