import { Selector, ParametricSelector } from 'reselect';
import { NamedSelector, NamedParametricSelector } from './types';
import { getSelectorName, isDebugMode } from './helpers';

export type Defined<T> = Exclude<T, undefined>;

export type RequiredSelectorBuilder<S, R, D> = () => NamedSelector<S, R, D>;

export type OptionalSelectorBuilder<S, R, D> = {
  (noDefaultValue?: undefined): NamedSelector<S, Defined<R> | undefined, D>;

  (defaultValue: NonNullable<R>): NamedSelector<S, NonNullable<R>, D>;

  (nullDefaultValue: R extends null ? null : never): NamedSelector<
    S,
    Defined<R>,
    D
  >;
};

export type RequiredParametricSelectorBuilder<
  S,
  P,
  R,
  D
> = () => NamedParametricSelector<S, P, R, D>;

export type OptionalParametricSelectorBuilder<S, P, R, D> = {
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

export type RequiredObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: undefined extends R[K]
    ? OptionalPathSelectorType<S, R[K], D>
    : null extends R[K]
    ? OptionalPathSelectorType<S, R[K], D>
    : RequiredPathSelectorType<S, R[K], D>;
};

export type OptionalObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: OptionalPathSelectorType<S, R[K], D>;
};

export type RequiredObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: undefined extends R[K]
    ? OptionalPathParametricSelectorType<S, P, R[K], D>
    : null extends R[K]
    ? OptionalPathParametricSelectorType<S, P, R[K], D>
    : RequiredPathParametricSelectorType<S, P, R[K], D>;
};

export type OptionalObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: OptionalPathParametricSelectorType<S, P, R[K], D>;
};

export type ArraySelectorWrapper<S, R, D> = {
  length: RequiredPathSelectorType<S, number, D>;

  [K: number]: OptionalPathSelectorType<S, R, D>;
};

export type ArrayParametricSelectorWrapper<S, P, R, D> = {
  length: RequiredPathParametricSelectorType<S, P, number, D>;

  [K: number]: OptionalPathParametricSelectorType<S, P, R, D>;
};

export type RequiredDataSelectorWrapper<S, R, D> = R extends unknown[]
  ? ArraySelectorWrapper<S, R[number], D>
  : R extends object
  ? RequiredObjectSelectorWrapper<S, R, D>
  : RequiredSelectorBuilder<S, R, D>;

export type OptionalDataSelectorWrapper<S, R, D> = R extends unknown[]
  ? ArraySelectorWrapper<S, R[number], D>
  : R extends object
  ? OptionalObjectSelectorWrapper<S, R, D>
  : OptionalSelectorBuilder<S, R, D>;

export type RequiredDataParametricSelectorWrapper<
  S,
  P,
  R,
  D
> = R extends unknown[]
  ? ArrayParametricSelectorWrapper<S, P, R[number], D>
  : R extends object
  ? RequiredObjectParametricSelectorWrapper<S, P, R, D>
  : RequiredParametricSelectorBuilder<S, P, R, D>;

export type OptionalDataParametricSelectorWrapper<
  S,
  P,
  R,
  D
> = R extends unknown[]
  ? ArrayParametricSelectorWrapper<S, P, R[number], D>
  : R extends object
  ? OptionalObjectParametricSelectorWrapper<S, P, R, D>
  : OptionalParametricSelectorBuilder<S, P, R, D>;

export type RequiredPathSelectorType<S, R, D> = RequiredSelectorBuilder<
  S,
  R,
  D
> &
  RequiredDataSelectorWrapper<S, NonNullable<R>, D>;

export type OptionalPathSelectorType<S, R, D> = OptionalSelectorBuilder<
  S,
  R,
  D
> &
  OptionalDataSelectorWrapper<S, NonNullable<R>, D>;

export type RequiredPathParametricSelectorType<
  S,
  P,
  R,
  D
> = RequiredParametricSelectorBuilder<S, P, R, D> &
  RequiredDataParametricSelectorWrapper<S, P, NonNullable<R>, D>;

export type OptionalPathParametricSelectorType<
  S,
  P,
  R,
  D
> = OptionalParametricSelectorBuilder<S, P, R, D> &
  OptionalDataParametricSelectorWrapper<S, P, NonNullable<R>, D>;

const isObject = (value: unknown) =>
  value !== null && typeof value === 'object';

const isNullOrUndefined = (value: unknown) =>
  value === null || value === undefined;

const innerCreatePathSelector = <S, P, R>(
  baseSelector: Function,
  path: PropertyKey[] = [],
): unknown => {
  const proxyTarget = (defaultValue?: unknown) => {
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
): undefined extends R
  ? OptionalPathSelectorType<S, R, [Selector<S, R>]>
  : null extends R
  ? OptionalPathSelectorType<S, R, [Selector<S, R>]>
  : RequiredPathSelectorType<S, R, [Selector<S, R>]>;

export function createPathSelector<S, P, R>(
  baseSelector: ParametricSelector<S, P, R>,
): undefined extends R
  ? OptionalPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>
  : null extends R
  ? OptionalPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>
  : RequiredPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>;

export function createPathSelector<S, P, R>(baseSelector: Function) {
  return innerCreatePathSelector(baseSelector);
}
