import { FlatMapCache } from 're-reselect';
import { TreeCache } from '../TreeCache';

describe('TreeCache', () => {
  test('should validate key', () => {
    let cache = new TreeCache({});

    let actual: boolean;
    actual = cache.isValidCacheKey(['1', 2]);
    expect(actual).toBeTruthy();

    actual = cache.isValidCacheKey(['1', {}]);
    expect(actual).toBeFalsy();

    cache = new TreeCache({
      cacheObjectCreator: () => new FlatMapCache(),
    });

    actual = cache.isValidCacheKey(['1', 2]);
    expect(actual).toBeTruthy();

    actual = cache.isValidCacheKey(['1', {}]);
    expect(actual).toBeTruthy();
  });

  test('should normalize scalar key', () => {
    let cache = new TreeCache({});

    let actual: boolean;
    actual = cache.isValidCacheKey({});
    expect(actual).toBeFalsy();

    cache = new TreeCache({
      cacheObjectCreator: () => new FlatMapCache(),
    });

    actual = cache.isValidCacheKey({});
    expect(actual).toBeTruthy();
  });

  test('should return undefined if there is not value for key', () => {
    const cache = new TreeCache({});

    let actual: unknown;
    actual = cache.get(['some', 'deep', 'key']);
    expect(actual).toBeUndefined();

    cache.set(['some', 'deep'], expect.anything());
    actual = cache.get(['some', 'deep', 'key']);
    expect(actual).toBeUndefined();
  });

  test('should return undefined if key path is short', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;

    cache.set(['some', 'deep', 'key'], selectorFn);
    const actual = cache.get(['some', 'deep']);
    expect(actual).toBeUndefined();
  });

  test('should set value in key path', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;

    cache.set(['some', 'deep', 'key'], selectorFn);
    const actual = cache.get(['some', 'deep', 'key']);
    expect(actual).toBe(selectorFn);
  });

  test('should remove value in key path', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;

    let actual: unknown;
    cache.set(['some', 'deep', 'key'], selectorFn);
    actual = cache.get(['some', 'deep', 'key']);
    expect(actual).toBe(selectorFn);

    cache.remove(['some', 'deep', 'key']);
    actual = cache.get(['some', 'deep', 'key']);
    expect(actual).toBeUndefined();
  });

  test('should do nothing if there is not value for removable key', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;

    cache.set(['some', 'deep'], selectorFn);
    cache.remove(['some', 'deep', 'key']);

    const actual = cache.get(['some', 'deep']);
    expect(actual).toBe(selectorFn);
  });

  test('should clear values', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;
    const otherSelectorFn = () => undefined;

    cache.set(['some', 'deep', 'key'], selectorFn);
    cache.set(['some', 'other', 'key'], otherSelectorFn);
    expect(cache.get(['some', 'deep', 'key'])).toBe(selectorFn);
    expect(cache.get(['some', 'other', 'key'])).toBe(otherSelectorFn);

    cache.clear();
    expect(cache.get(['some', 'deep', 'key'])).toBeUndefined();
    expect(cache.get(['some', 'other', 'key'])).toBeUndefined();
  });

  test('should persist values in middle of tree', () => {
    const cache = new TreeCache({});
    const selectorFn = () => undefined;
    const otherSelectorFn = () => undefined;

    cache.set(['some', 'deep'], selectorFn);
    cache.set(['some', 'deep', 'key'], otherSelectorFn);

    expect(cache.get(['some', 'deep'])).toBe(selectorFn);
    expect(cache.get(['some', 'deep', 'key'])).toBe(otherSelectorFn);
  });
});
