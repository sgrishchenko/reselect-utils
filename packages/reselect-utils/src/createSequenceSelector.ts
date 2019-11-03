import { createSelector, ParametricSelector, Selector } from 'reselect';

export function createSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
  selectorCreator?: typeof createSelector,
): Selector<S, R[]>;

export function createSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
  selectorCreator?: typeof createSelector,
): ParametricSelector<S, P, R[]>;

export function createSequenceSelector(
  selectors: any,
  selectorCreator = createSelector,
) {
  return selectorCreator(selectors, (...results) => results);
}
