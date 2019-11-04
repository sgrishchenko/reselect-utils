import { Selector, ParametricSelector } from 'reselect';
import { NamedSelector, NamedParametricSelector } from './types';
import { getSelectorName, isDebugMode } from './helpers';

export type Defined<T> = Exclude<T, undefined>;

export type SelectorBuilder<S, R, D> = {
  (noDefaultValue?: undefined): NamedSelector<S, Defined<R> | undefined, D>;

  (defaultValue: NonNullable<R>): NamedSelector<S, NonNullable<R>, D>;

  (nullDefaultValue: R extends null ? null : never): NamedSelector<
    S,
    Defined<R>,
    D
  >;
};

export type ParametricSelectorBuilder<S, P, R, D> = {
  (noDefaultValue?: undefined): NamedParametricSelector<
    S,
    P,
    Defined<R> | undefined,
    D
  >;

  (defaultValue: NonNullable<R>): NamedParametricSelector<
    S,
    P,
    NonNullable<R>,
    D
  >;

  (nullDefaultValue: R extends null ? null : never): NamedParametricSelector<
    S,
    P,
    Defined<R>,
    D
  >;
};

export type ObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: PathSelectorType<S, R[K], D>;
};

export type ObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: PathParametricSelectorType<S, P, R[K], D>;
};

export type ArraySelectorWrapper<S, R, D> = {
  length: PathSelectorType<S, number, D>;

  [K: number]: PathSelectorType<S, R, D>;
};

export type ArrayParametricSelectorWrapper<S, P, R, D> = {
  length: PathParametricSelectorType<S, P, number, D>;

  [K: number]: PathParametricSelectorType<S, P, R, D>;
};

export type DataSelectorWrapper<S, R, D> = R extends any[]
  ? ArraySelectorWrapper<S, R[number], D>
  : R extends object
  ? ObjectSelectorWrapper<S, R, D>
  : SelectorBuilder<S, R, D>;

export type DataParametricSelectorWrapper<S, P, R, D> = R extends any[]
  ? ArrayParametricSelectorWrapper<S, P, R[number], D>
  : R extends object
  ? ObjectParametricSelectorWrapper<S, P, R, D>
  : ParametricSelectorBuilder<S, P, R, D>;

export type PathSelectorType<S, R, D> = SelectorBuilder<S, R, D> &
  DataSelectorWrapper<S, NonNullable<R>, D>;

export type PathParametricSelectorType<S, P, R, D> = ParametricSelectorBuilder<
  S,
  P,
  R,
  D
> &
  DataParametricSelectorWrapper<S, P, NonNullable<R>, D>;

const isObject = (value: unknown) =>
  value !== null && typeof value === 'object';

const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

const innerCreatePathSelector = (
  baseSelector: any,
  path: PropertyKey[] = [],
): any => {
  const proxyTarget = (defaultValue?: any) => {
    function resultSelector() {
      // performance optimisation
      // eslint-disable-next-line prefer-spread,prefer-rest-params
      let result = baseSelector.apply(null, arguments);

      for (let i = 0; i < path.length && isObject(result); i += 1) {
        result = result[path[i]];
      }

      return isNullOrUndefined(result) ? defaultValue : result;
    }

    resultSelector.dependencies = [baseSelector];

    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore else  */
      if (isDebugMode()) {
        const baseName = getSelectorName(baseSelector);

        resultSelector.selectorName = [baseName, ...path].join('.');
      }
    }

    return resultSelector;
  };

  return new Proxy(proxyTarget, {
    get: (target, key) => innerCreatePathSelector(baseSelector, [...path, key]),
  });
};

export function createPathSelector<S, R>(
  baseSelector: Selector<S, R>,
): PathSelectorType<S, R, [Selector<S, R>]>;

export function createPathSelector<S, P, R>(
  baseSelector: ParametricSelector<S, P, R>,
): PathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>;

export function createPathSelector(baseSelector: any) {
  return innerCreatePathSelector(baseSelector);
}
