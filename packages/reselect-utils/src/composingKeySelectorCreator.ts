import { KeySelector, ParametricKeySelector } from 're-reselect';
import { tryExtractCachedSelector } from './helpers';
import { composeKeySelectors } from './composeKeySelectors';

export function composingKeySelectorCreator<S, C, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: KeySelector<S>;
}): KeySelector<S>;

export function composingKeySelectorCreator<S, P, C, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: ParametricKeySelector<S, P>;
}): ParametricKeySelector<S, P>;

export function composingKeySelectorCreator({
  inputSelectors,
  keySelector,
}: any) {
  const keySelectorSet = new Set<any>();

  if (keySelector) {
    keySelectorSet.add(keySelector);
  }

  inputSelectors.forEach((selector: any) => {
    const cachedSelector = tryExtractCachedSelector(selector);
    if (cachedSelector) {
      keySelectorSet.add(cachedSelector.keySelector);
    }
  });

  const keySelectors = [...keySelectorSet];

  if (keySelectors.length === 0) {
    return () => '<DefaultKey>';
  }

  if (keySelectors.length === 1) {
    const [resultSelector] = keySelectors;
    return resultSelector;
  }

  return composeKeySelectors(...keySelectors);
}
