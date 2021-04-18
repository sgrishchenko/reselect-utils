import { createSelector, ParametricSelector, Selector } from 'reselect';
import { createCachedSelector } from 're-reselect';
import { Options, ParametricOptions } from './types';
import { createStructuredSelector } from './createStructuredSelector';

export function createCachedStructuredSelector<M>(
  selectors: M,
): M extends { [K in keyof M]: Selector<infer S, unknown> }
  ? (
      options: Options<
        S,
        (...results: unknown[]) => { [K in keyof M]: ReturnType<M[K]> },
        Selector<S, unknown>[]
      >,
    ) => Selector<S, { [K in keyof M]: ReturnType<M[K]> }>
  : M extends { [K in keyof M]: ParametricSelector<infer S, infer P, unknown> }
  ? (
      options: ParametricOptions<
        S,
        P,
        (...results: unknown[]) => { [K in keyof M]: ReturnType<M[K]> },
        ParametricSelector<S, P, unknown>[]
      >,
    ) => ParametricSelector<S, P, { [K in keyof M]: ReturnType<M[K]> }>
  : never;

export function createCachedStructuredSelector(selectors: any): any {
  return createStructuredSelector(
    selectors,
    (createCachedSelector as unknown) as typeof createSelector,
  );
}
