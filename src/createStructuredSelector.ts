import { createSelector } from 'reselect';
import { ParametricSelector, Selector } from './types';

function createStructuredSelector<M>(
  selectors: M,
  selectorCreator?: typeof createSelector,
): M extends { [K in keyof M]: Selector<infer S, unknown> }
  ? Selector<S, { [K in keyof M]: ReturnType<M[K]> }>
  : M extends { [K in keyof M]: ParametricSelector<infer S, infer P, unknown> }
  ? ParametricSelector<S, P, { [K in keyof M]: ReturnType<M[K]> }>
  : never;

function createStructuredSelector(
  selectors: any,
  selectorCreator = createSelector,
): any {
  const objectKeys = Object.keys(selectors);
  return selectorCreator(objectKeys.map(key => selectors[key]), (...values) => {
    return values.reduce((composition, value, index) => {
      return {
        ...composition,
        [objectKeys[index]]: value,
      };
    }, {});
  });
}

export default createStructuredSelector;
