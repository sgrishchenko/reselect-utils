import { ParametricSelector, Selector } from 'reselect';
import createCachedSelector from 're-reselect';
import { Options, ParametricOptions } from './types';
import createSequenceSelector from './createSequenceSelector';

function createCachedSequenceSelector<S, R>(
  selectors: Selector<S, R>[],
): (
  options: Options<S, (...results: R[]) => R[], Selector<S, R>[]>,
) => Selector<S, R[]>;

function createCachedSequenceSelector<S, P, R>(
  selectors: ParametricSelector<S, P, R>[],
): (
  options: ParametricOptions<
    S,
    P,
    (...results: R[]) => R[],
    ParametricSelector<S, P, R>[]
  >,
) => ParametricSelector<S, P, R[]>;

function createCachedSequenceSelector(selectors: any): any {
  return createSequenceSelector(selectors, createCachedSelector as any);
}

export default createCachedSequenceSelector;
