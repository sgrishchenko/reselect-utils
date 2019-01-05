import {ParametricSelector} from 'reselect';
import {ICacheObject} from 're-reselect';

type CacheItem = {
    selector: ParametricSelector<any, any, any>,
    refCount: number,
    removeTimeoutHandle?: number,
}

type Key = string | number;

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
            selector,
            refCount: 1,
        };
    }

    get(key: Key) {
        const cacheItem = this.cache[key];
        if (cacheItem === undefined) {
            return undefined
        }

        cacheItem.refCount++;
        clearTimeout(cacheItem.removeTimeoutHandle);

        return cacheItem.selector;
    }

    remove(key: Key) {
        const cacheItem = this.cache[key];
        cacheItem.refCount--;

        if (cacheItem.refCount === 0) {
            cacheItem.removeTimeoutHandle = setTimeout(() => {
                delete this.cache[key];
            }, this.options.removeDelay);
        }
    }

    clear() {
        Object.keys(this.cache)
            .forEach(key => this.remove(key));
    }

    isValidCacheKey(key: Key) {
        return typeof key === 'string' || typeof key === 'number';
    }
}