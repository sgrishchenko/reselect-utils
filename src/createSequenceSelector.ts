import { createSelector } from 'reselect';
import { ParametricSelector, Selector } from './types';

function createSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
): Selector<S, R[]>;

function createSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
): ParametricSelector<S, P, R[]>;

function createSequenceSelector(selectors: any) {
  return createSelector(
    selectors,
    (...results) => results,
  );
}

export default createSequenceSelector;
