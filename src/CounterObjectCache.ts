import {ParametricSelector} from 'reselect';
import {ICacheObject, OutputParametricCachedSelector} from 're-reselect';

type Key = string | number;

type TaggedSelector = ParametricSelector<any, any, any> & {
    key: Key
}

type CacheItem = {
    selector: TaggedSelector,
    refCount: number,
    removeTimeoutHandle?: number,
}

type Cache = {
    [K in Key]: CacheItem
}

type CounterObjectCacheOptions = {
    removeDelay?: number
}

const defaultOptions: CounterObjectCacheOptions = {
    removeDelay: 0
};

export default class CounterObjectCache implements ICacheObject {
    private cache: Cache = {};
    private options: CounterObjectCacheOptions;

    constructor(options: CounterObjectCacheOptions = {}) {
        this.options = {
            ...defaultOptions,
            ...options
        }
    }

    set(key: Key, selector: ParametricSelector<any, any, any>) {
        this.cache[key] = {
            selector: Object.assign(selector, {key}),
            refCount: 0,
        };
    }

    get(key: Key) {
        const cacheItem = this.cache[key];
        if (cacheItem === undefined) {
            return undefined
        }

        return cacheItem.selector;
    }

    remove(key: Key) {
        delete this.cache[key]
    }

    clear() {
        this.cache = {};
    }

    isValidCacheKey(key: Key) {
        return typeof key === 'string' || typeof key === 'number';
    }

    addRef(selector: TaggedSelector) {
        const cacheItem = this.cache[selector.key];

        if (cacheItem) {
            cacheItem.refCount++;
            clearTimeout(cacheItem.removeTimeoutHandle);
        }
    }

    removeRef(selector: TaggedSelector) {
        const cacheItem = this.cache[selector.key];

        if (cacheItem) {
            cacheItem.refCount--;
            if (cacheItem.refCount === 0) {
                cacheItem.removeTimeoutHandle = setTimeout(() => {
                    this.remove(selector.key);
                }, this.options.removeDelay);
            }
        }
    }

    private static makeRecursivelyHandler(
        handler: 'addRef' | 'removeRef',
        recursivelyHandler: 'addRefRecursively' | 'removeRefRecursively'
    ) {
        return <S, P, R>(
            selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>
        ) => (state: S, props: P) => {

            if (typeof selector.getMatchingSelector === 'function') {
                const selectorInstance = selector.getMatchingSelector(state, props);
                if (selector.cache instanceof CounterObjectCache) {
                    selector.cache[handler](selectorInstance as any)
                }
            }

            if (Array.isArray((selector as any).dependencies)) {
                (selector as any).dependencies
                    .forEach((dep: any) => {
                        CounterObjectCache[recursivelyHandler](dep)(state, props)
                    })
            }
        }
    }

    static addRefRecursively = CounterObjectCache.makeRecursivelyHandler(
        'addRef',
        'addRefRecursively'
    );

    static removeRefRecursively = CounterObjectCache.makeRecursivelyHandler(
        'removeRef',
        'removeRefRecursively'
    );
}