import { ICacheObject, OutputParametricCachedSelector } from 're-reselect';
import { Selector, ParametricSelector } from './types';

type Key = string | number;

type TaggedSelector = ParametricSelector<any, any, any> & {
  key: Key;
};

type CacheItem = {
  selector: TaggedSelector;
  refCount: number;
  removeTimeoutHandle?: number;
};

type Cache = { [K in Key]?: CacheItem };

type CounterObjectCacheOptions = {
  removeDelay?: number;
};

const defaultOptions: CounterObjectCacheOptions = {
  removeDelay: 0,
};

export default class CounterObjectCache implements ICacheObject {
  public static addRefRecursively = CounterObjectCache.makeRecursivelyHandler(
    'addRef',
    'addRefRecursively',
  );

  public static removeRefRecursively = CounterObjectCache.makeRecursivelyHandler(
    'removeRef',
    'removeRefRecursively',
  );

  private static makeRecursivelyHandler(
    handler: 'addRef' | 'removeRef',
    recursivelyHandler: 'addRefRecursively' | 'removeRefRecursively',
  ) {
    return <S, P, R>(
      selector: Selector<S, R> | ParametricSelector<S, P, R>,
    ) => (state: S, props: P) => {
      if (CounterObjectCache.isReReselectSelector(selector)) {
        const selectorInstance = selector.getMatchingSelector(state, props);
        if (selector.cache instanceof CounterObjectCache && selectorInstance) {
          selector.cache[handler](selectorInstance as any);
        }
      }

      if (Array.isArray((selector as any).dependencies)) {
        (selector as any).dependencies.forEach((dep: any) => {
          CounterObjectCache[recursivelyHandler](dep)(state, props);
        });
      }
    };
  }

  private static isReReselectSelector<S, P, R>(
    selector: any,
  ): selector is ReturnType<OutputParametricCachedSelector<S, P, R, any, any>> {
    return typeof selector.getMatchingSelector === 'function';
  }

  private cache: Cache = {};

  private options: CounterObjectCacheOptions;

  public constructor(options: CounterObjectCacheOptions = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  public set(key: Key, selector: ParametricSelector<any, any, any>) {
    this.cache[key] = {
      selector: Object.assign(selector, { key }),
      refCount: 0,
    };
  }

  public get(key: Key) {
    const cacheItem = this.cache[key];
    if (cacheItem === undefined) {
      return undefined;
    }

    return cacheItem.selector;
  }

  public remove(key: Key) {
    delete this.cache[key];
  }

  public clear() {
    this.cache = {};
  }

  /* eslint-disable-next-line class-methods-use-this */
  public isValidCacheKey(key: any) {
    return typeof key === 'string' || typeof key === 'number';
  }

  public addRef(selector: TaggedSelector) {
    const cacheItem = this.cache[selector.key];

    if (cacheItem) {
      cacheItem.refCount += 1;
      clearTimeout(cacheItem.removeTimeoutHandle);
    }
  }

  public removeRef(selector: TaggedSelector) {
    const cacheItem = this.cache[selector.key];

    if (cacheItem && cacheItem.refCount !== 0) {
      cacheItem.refCount -= 1;
      if (cacheItem.refCount === 0) {
        cacheItem.removeTimeoutHandle = setTimeout(() => {
          this.remove(selector.key);
        }, this.options.removeDelay);
      }
    }
  }
}
