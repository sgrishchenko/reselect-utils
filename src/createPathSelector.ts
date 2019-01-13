import { Selector, ParametricSelector } from './types';

export type Defined<T> = Exclude<T, undefined>;

export type SelectorBuilder<S, R, D> = {
  (): Selector<S, Defined<R> | undefined, D>;

  (defaultValue: NonNullable<R>): Selector<S, NonNullable<R>, D>;

  (nullDefaultValue: R extends null ? null : never): Selector<S, Defined<R>, D>;
};

export type ParametricSelectorBuilder<S, P, R, D> = {
  (): ParametricSelector<S, P, Defined<R> | undefined, D>;

  (defaultValue: NonNullable<R>): ParametricSelector<S, P, NonNullable<R>, D>;

  (nullDefaultValue: R extends null ? null : never): ParametricSelector<
    S,
    P,
    Defined<R>,
    D
  >;
};

export type ObjectSelectorWrapper<S, R, D> = {
  [K in keyof R]-?: PathSelectorType<S, R[K], D>
};

export type ObjectParametricSelectorWrapper<S, P, R, D> = {
  [K in keyof R]-?: PathParametricSelectorType<S, P, R[K], D>
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
    const resultSelector = (...args: any[]) => {
      let result = baseSelector(...args);

      for (let i = 0; i < path.length && isObject(result); i += 1) {
        result = result[path[i]];
      }

      return isNullOrUndefined(result) ? defaultValue : result;
    };

    const baseName = baseSelector.selectorName || baseSelector.name;
    resultSelector.selectorName = [baseName, ...path].join('.');
    resultSelector.dependencies = [baseSelector];

    return resultSelector;
  };

  return new Proxy(proxyTarget, {
    get: (target, key) => innerCreatePathSelector(baseSelector, [...path, key]),
  });
};

function createPathSelector<S, R>(
  baseSelector: Selector<S, R>,
): PathSelectorType<S, R, [Selector<S, R>]>;

function createPathSelector<S, P, R>(
  baseSelector: ParametricSelector<S, P, R>,
): PathParametricSelectorType<S, P, R, [ParametricSelector<S, P, R>]>;

function createPathSelector(baseSelector: any) {
  return innerCreatePathSelector(baseSelector);
}

export default createPathSelector;
