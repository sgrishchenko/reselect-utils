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
): selector is CachedSelector => {
  return selector instanceof Object && 'keySelector' in selector;
};

export const areSelectorsEqual = (selector: unknown, another: unknown) => {
  if (selector === another) {
    return true;
  }

  if (
    selector instanceof Object &&
    another instanceof Object &&
    'isPropSelector' in selector &&
    'isPropSelector' in another
  ) {
    const { path: selectorPath } = selector as { path: (string | number)[] };
    const { path: anotherPath } = another as { path: (string | number)[] };

    if (selectorPath.length !== anotherPath.length) {
      return false;
    }

    for (let i = 0; i < selectorPath.length; i += 1) {
      if (selectorPath[i] !== anotherPath[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
};

export const defineDynamicSelectorName = (
  selector: unknown,
  selectorNameGetter: () => string,
) => {
  let overriddenSelectorName: string;
  Object.defineProperty(selector, 'selectorName', {
    configurable: true,
    get: () => {
      return overriddenSelectorName ?? selectorNameGetter();
    },
    set: (value: string) => {
      overriddenSelectorName = value;
    },
  });
};

let debugMode = true;

export const isDebugMode = () => debugMode;

export const setDebugMode = (value: boolean) => {
  debugMode = value;
};
