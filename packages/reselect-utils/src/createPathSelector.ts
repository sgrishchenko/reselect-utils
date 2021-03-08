import { Selector, ParametricSelector } from 'reselect';
import { NamedSelector, NamedParametricSelector } from './types';
import {
  defineDynamicSelectorName,
  getSelectorName,
  isDebugMode,
  isObject,
} from './helpers';

export type Defined<T> = Exclude<T, undefined>;

export type IsOptional<T> = undefined extends T
  ? true
  : null extends T
  ? true
  : false;

// eslint-disable-next-line @typescript-eslint/ban-types
export type IsObject<T> = T extends object ? true : false;

export type PathSelector<S, R, D> = NamedSelector<S, R, D> & {
  path: (string | number)[];
};

export type PathParametricSelector<S, P, R, D> = NamedParametricSelector<
  S,
  P,
  R,
  D
> & {
  path: (string | number)[];
};

export type RequiredSelectorBuilder<S, R, D> = () => PathSelector<S, R, D>;

export type OptionalSelectorBuilder<S, R, D> = {
  (noDefaultValue?: undefined): PathSelector<S, Defined<R> | undefined, D>;

  (defaultValue: NonNullable<R>): PathSelector<S, NonNullable<R>, D>;

  (nullDefaultValue: R extends null ? null : never): PathSelector<
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
> = () => PathParametricSelector<S, P, R, D>;

export type OptionalParametricSelectorBuilder<S, P, R, D> = {
  (noDefaultValue?: undefined): PathParametricSelector<
    S,
    P,
    Defined<R> | undefined,
    D
  >;

  (defaultValue: NonNullable<R>): PathParametricSelector<
    S,
    P,
    NonNullable<R>,
    D
  >;

  (nullDefaultValue: R extends null ? null : never): PathParametricSelector<
    S,
    P,
    Defined<R>,
    D
  >;
};

export type RequiredObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: IsOptional<R[K]> extends true
    ? OptionalPathSelectorType<S, R[K], D>
    : RequiredPathSelectorType<S, R[K], D>;
};

export type OptionalObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: OptionalPathSelectorType<S, R[K], D>;
};

export type RequiredObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: IsOptional<R[K]> extends true
    ? OptionalPathParametricSelectorType<S, P, R[K], D>
    : RequiredPathParametricSelectorType<S, P, R[K], D>;
};

export type OptionalObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: OptionalPathParametricSelectorType<S, P, R[K], D>;
};

export type RequiredArraySelectorWrapper<S, R, D> = {
  length: RequiredPathSelectorType<S, number, D>;

  [K: number]: IsOptional<R> extends true
    ? OptionalPathSelectorType<S, R, D>
    : RequiredPathSelectorType<S, R, D>;
};

export type OptionalArraySelectorWrapper<S, R, D> = {
  length: RequiredPathSelectorType<S, number, D>;

  [K: number]: OptionalPathSelectorType<S, R, D>;
};

export type RequiredArrayParametricSelectorWrapper<S, P, R, D> = {
  length: RequiredPathParametricSelectorType<S, P, number, D>;

  [K: number]: IsOptional<R> extends true
    ? OptionalPathParametricSelectorType<S, P, R, D>
    : RequiredPathParametricSelectorType<S, P, R, D>;
};

export type OptionalArrayParametricSelectorWrapper<S, P, R, D> = {
  length: RequiredPathParametricSelectorType<S, P, number, D>;

  [K: number]: OptionalPathParametricSelectorType<S, P, R, D>;
};

export type RequiredDataSelectorWrapper<S, R, D> = R extends unknown[]
  ? RequiredArraySelectorWrapper<S, R[number], D>
  : IsObject<R> extends true
  ? RequiredObjectSelectorWrapper<S, R, D>
  : RequiredSelectorBuilder<S, R, D>;

export type OptionalDataSelectorWrapper<S, R, D> = R extends unknown[]
  ? OptionalArraySelectorWrapper<S, R[number], D>
  : IsObject<R> extends true
  ? OptionalObjectSelectorWrapper<S, R, D>
  : OptionalSelectorBuilder<S, R, D>;

export type RequiredDataParametricSelectorWrapper<
  S,
  P,
  R,
  D
> = R extends unknown[]
  ? RequiredArrayParametricSelectorWrapper<S, P, R[number], D>
  : IsObject<R> extends true
  ? RequiredObjectParametricSelectorWrapper<S, P, R, D>
  : RequiredParametricSelectorBuilder<S, P, R, D>;

export type OptionalDataParametricSelectorWrapper<
  S,
  P,
  R,
  D
> = R extends unknown[]
  ? OptionalArrayParametricSelectorWrapper<S, P, R[number], D>
  : IsObject<R> extends true
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

/** @internal */
export const innerCreatePathSelector = (
  baseSelector: (...args: unknown[]) => unknown,
  path: (string | number)[] = [],
  applyMeta: (selector: unknown) => void = () => {},
): unknown => {
  const proxyTarget = (defaultValue?: unknown) => {
    function resultSelector() {
      // performance optimisation
      // eslint-disable-next-line prefer-spread
      let result = baseSelector.apply(
        null,
        // eslint-disable-next-line prefer-rest-params
        (arguments as unknown) as unknown[],
      );

      for (let i = 0; i < path.length && isObject(result); i += 1) {
        result = result[path[i]];
      }

      return result ?? defaultValue;
    }

    Object.assign(resultSelector, baseSelector, { path });
    resultSelector.dependencies = [baseSelector];

    applyMeta(resultSelector);

    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore else  */
      if (isDebugMode()) {
        defineDynamicSelectorName(resultSelector, () => {
          const baseName = getSelectorName(baseSelector);

          return [baseName, ...path].join('.');
        });
      }
    }

    return resultSelector;
  };

  return new Proxy(proxyTarget, {
    get: (target, key: string | number) =>
      innerCreatePathSelector(baseSelector, [...path, key], applyMeta),
  });
};

export function createPathSelector<S, R>(
  baseSelector: Selector<S, R>,
): IsOptional<R> extends true
  ? OptionalPathSelectorType<S, R, [Selector<S, R>]>
  : RequiredPathSelectorType<S, R, [Selector<S, R>]>;

export function createPathSelector<S, P, R>(
  baseSelector: ParametricSelector<S, P, R>,
): IsOptional<R> extends true
  ? OptionalPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>
  : RequiredPathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>;

export function createPathSelector(
  baseSelector: (...args: unknown[]) => unknown,
) {
  return innerCreatePathSelector(baseSelector);
}
