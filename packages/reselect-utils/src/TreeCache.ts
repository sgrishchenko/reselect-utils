// eslint-disable-next-line max-classes-per-file
import { FlatObjectCache, ICacheObject } from 're-reselect';

export type TreeCacheObjectOptions = {
  cacheObjectCreator?: () => ICacheObject;
};

const normalizeKey = (key: unknown): unknown[] =>
  Array.isArray(key) ? key : [key];

class TreeCacheNode {
  public cache?: ICacheObject;

  public selectorFn?: unknown;
}

export class TreeCache implements ICacheObject {
  private readonly cacheObjectCreator: () => ICacheObject;

  private root: TreeCacheNode;

  constructor(options: TreeCacheObjectOptions) {
    this.cacheObjectCreator =
      options.cacheObjectCreator ?? (() => new FlatObjectCache());

    const root = new TreeCacheNode();
    root.cache = this.cacheObjectCreator();
    this.root = root;
  }

  public clear() {
    const root = new TreeCacheNode();
    root.cache = this.cacheObjectCreator();
    this.root = root;
  }

  public get(key: unknown) {
    const keyPath = normalizeKey(key);
    let currentNode = this.root;

    for (let i = 0; i < keyPath.length; i += 1) {
      const item = keyPath[i];
      const cacheResponse: unknown = currentNode.cache?.get(item);

      if (cacheResponse instanceof TreeCacheNode) {
        currentNode = cacheResponse;
      } else {
        return undefined;
      }
    }

    return currentNode.selectorFn;
  }

  public set(key: unknown, selectorFn: unknown) {
    const keyPath = normalizeKey(key);
    let currentNode = this.root;

    for (let i = 0; i < keyPath.length; i += 1) {
      const item = keyPath[i];

      if (!currentNode.cache) {
        currentNode.cache = this.cacheObjectCreator();
      }

      const cacheResponse: unknown = currentNode.cache.get(item);

      if (cacheResponse instanceof TreeCacheNode) {
        currentNode = cacheResponse;
      } else {
        const node = new TreeCacheNode();
        currentNode.cache.set(item, node);
        currentNode = node;
      }
    }

    currentNode.selectorFn = selectorFn;
  }

  public remove(key: unknown): void {
    const keyPath = normalizeKey(key);
    let currentNode = this.root;

    for (let i = 0; i < keyPath.length; i += 1) {
      const item = keyPath[i];
      const cacheResponse: unknown = currentNode.cache?.get(item);

      if (cacheResponse instanceof TreeCacheNode) {
        currentNode = cacheResponse;
      } else {
        return undefined;
      }
    }

    currentNode.selectorFn = undefined;
    return undefined;
  }

  public isValidCacheKey(key: unknown) {
    const keyPath = normalizeKey(key);

    return keyPath.every(
      (item) => this.root.cache?.isValidCacheKey?.(item) ?? true,
    );
  }
}
