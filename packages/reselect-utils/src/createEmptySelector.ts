import { ParametricSelector, Selector } from 'reselect';
import { isCachedSelector } from './helpers';
import { CachedSelector } from './types';

export const createEmptySelector = <S, P, R>(
  baseSelector: ParametricSelector<S, P, R> | Selector<S, R>,
): Selector<S, R | undefined> => {
  const emptySelector = () => undefined;

  if (isCachedSelector(baseSelector)) {
    const cachedEmptySelector = (emptySelector as unknown) as CachedSelector;

    cachedEmptySelector.keySelector = () => '<DefaultKey>';
  }

  return emptySelector;
};
