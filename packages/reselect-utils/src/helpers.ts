import { CachedSelector } from './types';

export const getSelectorName = (selector: {
  name: string;
  selectorName?: string;
}): string => {
  if ('selectorName' in selector && selector.selectorName) {
    return selector.selectorName;
  }

  return selector.name;
};

export const isCachedSelector = (
  selector: unknown,
): selector is CachedSelector =>
  selector instanceof Object && 'keySelector' in selector;

export const defineDynamicSelectorName = (
  selector: unknown,
  selectorNameGetter: () => string,
) => {
  let overriddenSelectorName: string;
  Object.defineProperty(selector, 'selectorName', {
    configurable: true,
    get: () => overriddenSelectorName ?? selectorNameGetter(),
    set: (value: string) => {
      overriddenSelectorName = value;
    },
  });
};

export const defaultKeySelector = () => '<DefaultKey>';

let debugMode = true;

export const isDebugMode = () => debugMode;

export const setDebugMode = (value: boolean) => {
  debugMode = value;
};

export const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object';

export const arePathsEqual = (
  path: (string | number)[],
  anotherPath: (string | number)[],
) => {
  if (path.length !== anotherPath.length) {
    return false;
  }

  for (let i = 0; i < path.length; i += 1) {
    if (path[i] !== anotherPath[i]) {
      return false;
    }
  }

  return true;
};

interface Node {
  obj: Record<string, unknown>;
  path: string[];
}

export const getObjectPaths = (obj: Record<string, unknown>) => {
  const paths: string[][] = [];
  const nodes: Node[] = [
    {
      obj,
      path: [],
    },
  ];

  while (nodes.length > 0) {
    const node = nodes.pop();

    if (node) {
      const keys = Object.keys(node.obj);

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const value = node.obj[key];
        const path = node.path.concat(key);

        if (isObject(value)) {
          nodes.push({
            obj: value,
            path,
          });
        } else {
          paths.push(path);
        }
      }
    }
  }
  return paths;
};
