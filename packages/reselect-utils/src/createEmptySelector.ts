import { ParametricSelector, Selector } from 'reselect';
import { defaultKeySelector, isCachedSelector } from './helpers';
import { CachedSelector } from './types';

export const createEmptySelector = <S, P, R>(
  baseSelector: ParametricSelector<S, P, R> | Selector<S, R, never>,
): Selector<S, R | undefined, never> => {
  const emptySelector = () => undefined;

  if (isCachedSelector(baseSelector)) {
    const cachedEmptySelector = (emptySelector as unknown) as CachedSelector;

    cachedEmptySelector.keySelector = defaultKeySelector;
  }

  return emptySelector;
};
