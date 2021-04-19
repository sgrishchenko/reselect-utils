import { rafDebounce } from '../debounce';
import { ICacheObject } from 're-reselect';

interface IntervalObjectCacheProps {
  removeInterval?: number;
}

const defaultRemoveInterval = 10000;

export default class IntervalObjectCache implements ICacheObject {
  private cache: {
    [key: string]: {
      timestamp: number;
      selector: object;
    };
  };

  private removeInterval: number;

  constructor(props?: IntervalObjectCacheProps) {
    this.cache = {};

    this.removeInterval =
      (props && props.removeInterval) || defaultRemoveInterval;
    window.setInterval(() => {
      this.removeOldCache();
    }, this.removeInterval);
  }

  public set(key: string, selectorFn: any) {
    this.cache[key] = {
      timestamp: new Date().getTime(),
      selector: selectorFn,
    };
  }

  public get(key: string | number) {
    this.cache[key] = {
      ...this.cache[key],
      timestamp: new Date().getTime(),
    };
    return this.cache[key].selector;
  }

  public remove(key: string | number) {
    delete this.cache[key];
  }

  public clear() {
    this.cache = {};
  }

  public isValidCacheKey(cacheKey: string | number) {
    return typeof cacheKey === 'string' || typeof cacheKey === 'number';
  }

  private removeOldCache = rafDebounce(() => {
    const currentTime = new Date().getTime();

    const keys = Object.keys(this.cache);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if ((currentTime - this.cache[key].timestamp) > this.removeInterval) {
        this.remove(key);
      }
    }
  });
};
