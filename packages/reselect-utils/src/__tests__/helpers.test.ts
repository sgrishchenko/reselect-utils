import { arePathsEqual, getObjectPaths } from '../helpers';

describe('getObjectPaths', () => {
  test('should extract keys from object', () => {
    const obj = {
      key1: 1,
      key2: 'sting',
      key3: true,
      key4: undefined,
      key5: null,
    };

    const actual = getObjectPaths(obj);

    expect(actual).toEqual([['key1'], ['key2'], ['key3'], ['key4'], ['key5']]);
  });

  test('should extract keys from nested object', () => {
    const obj = {
      key1: {
        key2: {
          key3: undefined,
        },
        key4: {
          key5: 1,
        },
        key6: {
          key7: 'sting',
          key8: null,
        },
      },
    };

    const actual = getObjectPaths(obj);

    expect(actual).toEqual([
      ['key1', 'key6', 'key7'],
      ['key1', 'key6', 'key8'],
      ['key1', 'key4', 'key5'],
      ['key1', 'key2', 'key3'],
    ]);
  });
});

describe('arePathsEqual', () => {
  test('should return false if paths have different length', () => {
    const path = ['first', 'second'];
    const anotherPath = ['123'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeFalsy();
  });

  test('should return false if paths have different elements', () => {
    const path = ['first', 'second'];
    const anotherPath = ['first', 'third'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeFalsy();
  });

  test('should return true if paths have equal elements', () => {
    const path = ['first', 'second'];
    const anotherPath = ['first', 'second'];

    const actual = arePathsEqual(path, anotherPath);
    expect(actual).toBeTruthy();
  });
});
