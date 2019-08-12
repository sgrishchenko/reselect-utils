import { ReReselectSelector } from './types';

export const getSelectorName = (selector: any): string =>
  selector.selectorName || selector.name;

export const isReReselectSelector = (
  selector: any,
): selector is ReReselectSelector => 'getMatchingSelector' in selector;

let debugMode = true;

export const isDebugMode = () => debugMode;

export const setDebugMode = (value: boolean) => {
  debugMode = value;
};
