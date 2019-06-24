import { ICacheObject, OutputParametricCachedSelector } from 're-reselect';
import { Selector, ParametricSelector } from './types';

type Key = string | number;

type CacheItem = {
  selector: ParametricSelector<any, any, any>;
  refCount: number;
  removeTimeoutHandle?: number;
};

type Cache = { [K in Key]?: CacheItem };

type CounterObjectCacheOptions = {
  removeDelay?: number;
};

const defaultOptions: Required<CounterObjectCacheOptions> = {
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
      if (CounterObjectCache.isCachedSelector(selector)) {
        const cacheKey = selector.keySelector(state, props);
        if (selector.cache instanceof CounterObjectCache) {
          selector.cache[handler](cacheKey);
        }
      }

      if (Array.isArray(selector.dependencies)) {
        selector.dependencies.forEach(dep => {
          CounterObjectCache[recursivelyHandler](dep)(state, props);
        });
      }
    };
  }

  private static isCachedSelector<S, P, R>(
    selector: any,
  ): selector is ReturnType<OutputParametricCachedSelector<S, P, R, any, any>> {
    return typeof selector.getMatchingSelector === 'function';
  }

  private cache: Cache = {};

  private options: CounterObjectCacheOptions;

  private warningHandled = false;

  private warningTimeoutHandle?: number;

  public constructor(options: CounterObjectCacheOptions = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    };
  }

  public set(key: Key, selector: ParametricSelector<any, any, any>) {
    this.cache[key] = {
      selector,
      refCount: 0,
    };
  }

  public get(key: Key) {
    if (process.env.NODE_ENV !== 'production') {
      if (!this.warningHandled) {
        this.warningHandled = true;

        const { stack } = new Error();
        this.warningTimeoutHandle = window.setTimeout(() => {
          /* eslint-disable-next-line no-console,@typescript-eslint/tslint/config */
          console.warn(
            'It seems you are using a cached selector ' +
              'with a CounterObjectCache without controlling the life cycle. ' +
              'Use reselectConnect and once for caching selectors.',
            stack,
          );
        }, 10);
      }
    }

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

  public addRef(key: Key) {
    if (process.env.NODE_ENV !== 'production') {
      if (this.warningTimeoutHandle) {
        window.clearTimeout(this.warningTimeoutHandle);
      }
    }

    const cacheItem = this.cache[key];

    if (cacheItem) {
      cacheItem.refCount += 1;
      window.clearTimeout(cacheItem.removeTimeoutHandle);
    }
  }

  public removeRef(key: Key) {
    const cacheItem = this.cache[key];

    if (cacheItem && cacheItem.refCount !== 0) {
      cacheItem.refCount -= 1;
      if (cacheItem.refCount === 0) {
        cacheItem.removeTimeoutHandle = window.setTimeout(() => {
          this.remove(key);
        }, this.options.removeDelay);
      }
    }
  }
}
