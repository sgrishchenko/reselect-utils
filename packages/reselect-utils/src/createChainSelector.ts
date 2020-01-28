import { createSelector, ParametricSelector, Selector } from 'reselect';
import createCachedSelector, {
  ParametricKeySelector,
  FifoMapCache,
  FifoObjectCache,
  FlatMapCache,
  FlatObjectCache,
  LruMapCache,
  LruObjectCache,
} from 're-reselect';
import { NamedSelector, NamedParametricSelector } from './types';
import {
  getSelectorName,
  isDebugMode,
  tryExtractCachedSelector,
} from './helpers';
import { composingKeySelectorCreator } from './composingKeySelectorCreator';

const sumString = (stringSource: object): number =>
  Array.from(stringSource.toString()).reduce(
    (sum, char) => char.charCodeAt(0) + sum,
    0,
  );

const generateSelectorKey = (selector: any): string =>
  (selector.dependencies || []).reduce(
    (base: number, dependency: any) => base + sumString(dependency),
    sumString(selector),
  );

const defineDynamicSelectorName = (
  selector: any,
  selectorNameGetter: () => string,
) => {
  Object.defineProperty(selector, 'selectorName', {
    configurable: true,
    get: selectorNameGetter,
    set: () => undefined,
  });
};

const cloneCacheObject = (cacheObject: any) => {
  // TODO: find more elegant solution for cloning
  if (
    cacheObject instanceof FifoMapCache ||
    cacheObject instanceof FifoObjectCache ||
    cacheObject instanceof FlatMapCache ||
    cacheObject instanceof FlatObjectCache ||
    cacheObject instanceof LruMapCache ||
    cacheObject instanceof LruObjectCache
  ) {
    // eslint-disable-next-line no-underscore-dangle
    const cacheSize = (cacheObject as any)._cacheSize;
    const CacheConstructor = cacheObject.constructor as any;
    return new CacheConstructor({ cacheSize });
  }

  return undefined;
};

export type SelectorChain<R1, S, P, R2> =
  | ((result: R1) => Selector<S, R2>)
  | ((result: R1) => ParametricSelector<S, P, R2>);

export type SelectorChainHierarchy<
  C extends SelectorChain<any, any, any, any>,
  H extends SelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

export class SelectorMonad<
  S1,
  P1,
  R1,
  SelectorType extends
    | NamedSelector<S1, R1>
    | NamedParametricSelector<S1, P1, R1>,
  SelectorChainType extends SelectorChainHierarchy<any, any>
> {
  private readonly selector: SelectorType;

  private readonly prevChain?: SelectorChainType;

  public constructor(selector: SelectorType, prevChain?: SelectorChainType) {
    this.selector = selector;
    this.prevChain = prevChain;
  }

  public chain<S2, R2>(
    fn: (result: R1) => Selector<S2, R2>,
  ): SelectorType extends Selector<S1, R1>
    ? SelectorMonad<
        S1 & S2,
        void,
        R2,
        Selector<S1 & S2, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >
    : SelectorMonad<
        S1 & S2,
        P1,
        R2,
        ParametricSelector<S1 & S2, P1, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >;

  public chain<S2, P2, R2>(
    fn: (result: R1) => ParametricSelector<S2, P2, R2>,
  ): SelectorType extends Selector<S1, R1>
    ? SelectorMonad<
        S1 & S2,
        P2,
        R2,
        ParametricSelector<S1 & S2, P2, R2>,
        SelectorChainHierarchy<
          (result: R1) => ParametricSelector<S2, P2, R2>,
          SelectorChainType
        >
      >
    : SelectorMonad<
        S1 & S2,
        P1 & P2,
        R2,
        ParametricSelector<S1 & S2, P1 & P2, R2>,
        SelectorChainHierarchy<
          (result: R1) => ParametricSelector<S2, P2, R2>,
          SelectorChainType
        >
      >;

  public chain(fn: any) {
    const cachedSelector = tryExtractCachedSelector(this.selector);

    const selectorCreator: any = cachedSelector
      ? createCachedSelector
      : createSelector;

    let higherOrderSelector = selectorCreator(this.selector, fn);

    if (cachedSelector) {
      higherOrderSelector = higherOrderSelector({
        keySelector: cachedSelector.keySelector,
        cacheObject: cloneCacheObject(cachedSelector.cache),
      });
    }

    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore else  */
      if (isDebugMode()) {
        defineDynamicSelectorName(higherOrderSelector, () => {
          const baseName = getSelectorName(this.selector);

          return `${baseName} (pre-chained ${sumString(fn)})`;
        });
      }
    }

    const combinedSelector = (state: any, props: any) => {
      const derivedSelector = higherOrderSelector(state, props);

      combinedSelector.dependencies = [higherOrderSelector, derivedSelector];
      if (cachedSelector) {
        combinedSelector.currentKeySelector = composingKeySelectorCreator({
          inputSelectors: combinedSelector.dependencies,
        });
      }

      /* istanbul ignore else  */
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore else  */
        if (isDebugMode()) {
          const derivedSelectorName = getSelectorName(derivedSelector);

          if (!derivedSelectorName) {
            defineDynamicSelectorName(derivedSelector, () => {
              const baseName = getSelectorName(this.selector);
              const derivedSelectorKey = generateSelectorKey(derivedSelector);

              return `derived from ${baseName} (${derivedSelectorKey})`;
            });
          }

          defineDynamicSelectorName(combinedSelector, () => {
            const baseName = getSelectorName(this.selector);
            const dependencyName = getSelectorName(derivedSelector);

            return `${baseName} (chained by ${dependencyName})`;
          });
        }
      }

      return derivedSelector(state, props);
    };

    const defaultKeySelector: ParametricKeySelector<any, any> = () =>
      '<DefaultKey>';

    combinedSelector.dependencies = [higherOrderSelector];
    combinedSelector.currentKeySelector = defaultKeySelector;

    if (cachedSelector) {
      combinedSelector.cache = higherOrderSelector.cache;
      combinedSelector.currentKeySelector = cachedSelector.keySelector;
    }

    combinedSelector.keySelector = (state: any, props: any) => {
      return combinedSelector.currentKeySelector(state, props);
    };

    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore else  */
      if (isDebugMode()) {
        defineDynamicSelectorName(combinedSelector, () => {
          const baseName = getSelectorName(this.selector);

          return `${baseName} (will be chained ${sumString(fn)})`;
        });
      }
    }

    return new SelectorMonad<any, any, any, any, any>(
      combinedSelector,
      Object.assign(fn, {
        parentChain: this.prevChain,
      }),
    );
  }

  public map<R2>(fn: (result: R1) => R2) {
    return this.chain(result => {
      const output = fn(result);
      return () => output;
    });
  }

  public build() {
    return Object.assign(this.selector, {
      chainHierarchy: this.prevChain,
    });
  }
}

export function createChainSelector<S, R>(
  selector: Selector<S, R>,
): SelectorMonad<S, void, R, Selector<S, R>, void>;

export function createChainSelector<S, P, R>(
  selector: ParametricSelector<S, P, R>,
): SelectorMonad<S, P, R, ParametricSelector<S, P, R>, void>;

export function createChainSelector(selector: any) {
  return new SelectorMonad<any, any, any, any, void>(selector);
}
