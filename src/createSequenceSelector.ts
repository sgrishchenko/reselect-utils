import { createSelector } from 'reselect';
import { ParametricSelector, Selector } from './types';

function createSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
  customSelectorCreator?: typeof createSelector,
): Selector<S, R[]>;

function createSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
  customSelectorCreator?: typeof createSelector,
): ParametricSelector<S, P, R[]>;

function createSequenceSelector(selectors: any, customSelectorCreator: any) {
  const selectorCreator = customSelectorCreator || createSelector;

  return selectorCreator(selectors, (...results: any) => results);
}

export default createSequenceSelector;
