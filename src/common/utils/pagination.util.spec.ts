import {
  paginationParams,
  paginatedResponse,
  singleResponse,
} from './pagination.util';

describe('paginationParams', () => {
  it('defaults to page=1 limit=10', () => {
    expect(paginationParams({})).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
    });
  });

  it('clamps limit to 100', () => {
    expect(paginationParams({ limit: 999 })).toMatchObject({
      limit: 100,
      take: 100,
    });
  });
});

describe('paginatedResponse', () => {
  it('returns data key (not items)', () => {
    const result = paginatedResponse(['a'], 1, {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
    });
    expect(result).toHaveProperty('data');
    expect(result).not.toHaveProperty('items');
    expect(result.data).toEqual(['a']);
    expect(result.meta.total).toBe(1);
  });
});

describe('singleResponse', () => {
  it('wraps value in data key', () => {
    expect(singleResponse({ id: '1' })).toEqual({ data: { id: '1' } });
  });
});
