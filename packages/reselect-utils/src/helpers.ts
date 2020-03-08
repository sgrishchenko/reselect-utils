import { NamedParametricSelector, CachedSelector } from './types';

export const getSelectorName = (
  selector: Function & { selectorName?: string },
): string => {
  if ('selectorName' in selector && selector.selectorName) {
    return selector.selectorName;
  }

  return selector.name;
};

export const isCachedSelectorSelector = (
  selector: unknown,
): selector is CachedSelector => {
  return selector instanceof Object && 'keySelector' in selector;
};

export const tryExtractCachedSelector = (
  selector: NamedParametricSelector<any, any, any> | CachedSelector,
): CachedSelector | undefined => {
  if (isCachedSelectorSelector(selector)) {
    return selector;
  }
  if (selector.dependencies && selector.dependencies.length === 1) {
    // adaptedSelector, boundSelector and pathSelector cases
    const [dependency] = selector.dependencies;
    return tryExtractCachedSelector(dependency);
  }
  return undefined;
};

export const defineDynamicSelectorName = (
  selector: Function,
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
