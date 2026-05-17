import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  it('strips script tags from string', () => {
    expect(pipe.transform('<script>alert(1)</script>hello')).toBe('hello');
  });

  it('strips nested HTML', () => {
    expect(pipe.transform('<b>bold</b> text')).toBe('bold text');
  });

  it('passes through numbers unchanged', () => {
    expect(pipe.transform(42)).toBe(42);
  });

  it('sanitizes object values recursively', () => {
    const result = pipe.transform({ name: '<b>Alice</b>', age: 30 });
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('sanitizes array of strings', () => {
    const result = pipe.transform(['<em>one</em>', '<b>two</b>']);
    expect(result).toEqual(['one', 'two']);
  });

  it('passes through null and undefined', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeUndefined();
  });
});
