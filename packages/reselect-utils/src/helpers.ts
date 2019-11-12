import { NamedParametricSelector, CachedSelector } from './types';

export const getSelectorName = (selector: any): string =>
  selector.selectorName || selector.name;

export const isCachedSelectorSelector = (
  selector: any,
): selector is CachedSelector => 'keySelector' in selector;

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

let debugMode = true;

export const isDebugMode = () => debugMode;

export const setDebugMode = (value: boolean) => {
  debugMode = value;
};
