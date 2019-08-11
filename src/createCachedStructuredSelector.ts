import createCachedSelector from 're-reselect';
import {
  Options,
  ParametricOptions,
  ParametricSelector,
  Selector,
} from './types';
import createStructuredSelector from './createStructuredSelector';

function createCachedStructuredSelector<M>(
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
        Selector<S, unknown>[]
      >,
    ) => ParametricSelector<S, P, { [K in keyof M]: ReturnType<M[K]> }>
  : never;

function createCachedStructuredSelector(selectors: any): any {
  return createStructuredSelector(selectors, createCachedSelector as any);
}

export default createCachedStructuredSelector;
