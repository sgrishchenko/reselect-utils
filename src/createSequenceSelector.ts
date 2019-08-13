import { createSelector, ParametricSelector, Selector } from 'reselect';

function createSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
  selectorCreator?: typeof createSelector,
): Selector<S, R[]>;

function createSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
  selectorCreator?: typeof createSelector,
): ParametricSelector<S, P, R[]>;

function createSequenceSelector(
  selectors: any,
  selectorCreator = createSelector,
) {
  return selectorCreator(selectors, (...results) => results);
}

export default createSequenceSelector;
