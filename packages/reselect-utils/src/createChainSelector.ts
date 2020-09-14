import { ParametricSelector, Selector } from 'reselect';
import createCachedSelector, { ICacheObject } from 're-reselect';
import { NamedSelector, NamedParametricSelector } from './types';
import {
  defineDynamicSelectorName,
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defaultKeySelector,
} from './helpers';
import { composingKeySelectorCreator } from './composingKeySelectorCreator';

const sumString = (source: unknown) => {
  const stringSource = String(source);
  let result = 0;

  for (let i = stringSource.length - 1; i >= 0; i -= 1) {
    const char = stringSource[i];

    result += char.charCodeAt(0);
  }

  return result;
};

const generateSelectorKey = (selector: unknown) => {
  const dependencies =
    (selector as { dependencies?: unknown[] }).dependencies ?? [];
  let result = sumString(selector);

  for (let i = dependencies.length - 1; i >= 0; i -= 1) {
    const dependency = dependencies[i];

    result += sumString(dependency);
  }

  return result;
};

export type ChainSelectorOptions = {
  createCacheObject?: () => ICacheObject;
};

export type SelectorChain<R1, S, P, R2> =
  | ((result: R1) => Selector<S, R2>)
  | ((result: R1) => ParametricSelector<S, P, R2>);

export type SelectorChainHierarchy<
  C extends SelectorChain<any, any, any, any>,
  H extends SelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

export type SelectorCreator<S, P, R1, R2> = (
  selector: Selector<S, R1> | ParametricSelector<S, P, R1>,
  combiner: (result: R1) => R2,
) => Selector<S, R2> | ParametricSelector<S, P, R2>;

export class SelectorMonad<
  S1,
  P1,
  R1,
  SelectorType extends Selector<S1, R1> | ParametricSelector<S1, P1, R1>,
  SelectorChainType extends SelectorChainHierarchy<any, any>
> {
  private readonly selector: SelectorType;

  private readonly options: ChainSelectorOptions;

  private readonly prevChain?: SelectorChainType;

  public constructor(
    selector: SelectorType,
    options: ChainSelectorOptions = {},
    prevChain?: SelectorChainType,
  ) {
    this.selector = selector;
    this.options = options;
    this.prevChain = prevChain;
  }

  public chain<S2, R2>(
    fn: (result: R1) => Selector<S2, R2>,
    options?: ChainSelectorOptions,
  ): SelectorType extends Selector<S1, R1>
    ? SelectorMonad<
        S1 & S2,
        void,
        R2,
        NamedSelector<S1 & S2, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >
    : SelectorMonad<
        S1 & S2,
        P1,
        R2,
        NamedParametricSelector<S1 & S2, P1, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >;

  public chain<S2, P2, R2>(
    fn: (result: R1) => ParametricSelector<S2, P2, R2>,
    options?: ChainSelectorOptions,
  ): SelectorType extends Selector<S1, R1>
    ? SelectorMonad<
        S1 & S2,
        P2,
        R2,
        NamedParametricSelector<S1 & S2, P2, R2>,
        SelectorChainHierarchy<
          (result: R1) => ParametricSelector<S2, P2, R2>,
          SelectorChainType
        >
      >
    : SelectorMonad<
        S1 & S2,
        P1 & P2,
        R2,
        NamedParametricSelector<S1 & S2, P1 & P2, R2>,
        SelectorChainHierarchy<
          (result: R1) => ParametricSelector<S2, P2, R2>,
          SelectorChainType
        >
      >;

  public chain<S2, P2, R2>(
    fn: SelectorChain<R1, S2, P2, R2>,
    inputOptions?: ChainSelectorOptions,
  ) {
    const options = {
      ...this.options,
      ...inputOptions,
    };

    const keySelector = isCachedSelector(this.selector)
      ? this.selector.keySelector
      : defaultKeySelector;

    const { createCacheObject = () => undefined } = options;

    const higherOrderSelector = createCachedSelector(
      this.selector,
      fn,
    )({
      keySelector,
      cacheObject: createCacheObject(),
    });

    /* istanbul ignore else  */
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore else  */
      if (isDebugMode()) {
        defineDynamicSelectorName(higherOrderSelector, () => {
          const baseName = getSelectorName(this.selector);

          return `higher order for ${baseName} (${sumString(fn)})`;
        });
      }
    }

    const combinedSelector = (state: S1 & S2, props: P1 & P2) => {
      const derivedSelector = higherOrderSelector(state, props);

      combinedSelector.dependencies = [higherOrderSelector, derivedSelector];

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

    combinedSelector.dependencies = [higherOrderSelector] as unknown[];
    combinedSelector.cache = higherOrderSelector.cache;

    const higherOrderKeySelector = createCachedSelector(
      higherOrderSelector,
      (derivedSelector) => {
        return composingKeySelectorCreator({
          inputSelectors: [higherOrderSelector, derivedSelector],
        });
      },
    )({
      keySelector,
      cacheObject: createCacheObject(),
    });

    combinedSelector.keySelector = (state: S1 & S2, props: P1 & P2) => {
      const derivedKeySelector = higherOrderKeySelector(state, props);
      return derivedKeySelector(state, props) as unknown;
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

    const prevChain = Object.assign(fn, {
      parentChain: this.prevChain,
    });

    return new SelectorMonad<
      S1 & S2,
      P1 & P2,
      R2,
      typeof combinedSelector,
      typeof prevChain
    >(combinedSelector, options, prevChain) as unknown;
  }

  public map<R2>(fn: (result: R1) => R2) {
    return this.chain((result) => {
      const output = fn(result);
      const selector = () => output;

      /* istanbul ignore else  */
      if (process.env.NODE_ENV !== 'production') {
        /* istanbul ignore else  */
        if (isDebugMode()) {
          defineDynamicSelectorName(selector, () => {
            const baseName = getSelectorName(this.selector);

            return `mapped from ${baseName} (${sumString(fn)})`;
          });
        }
      }

      return selector;
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
  options?: ChainSelectorOptions,
): SelectorMonad<S, void, R, Selector<S, R>, void>;

export function createChainSelector<S, P, R>(
  selector: ParametricSelector<S, P, R>,
  options?: ChainSelectorOptions,
): SelectorMonad<S, P, R, ParametricSelector<S, P, R>, void>;

export function createChainSelector<S, P, R>(
  selector: Selector<S, R> | ParametricSelector<S, P, R>,
  options?: ChainSelectorOptions,
) {
  return new SelectorMonad<S, P, R, typeof selector, never>(
    selector,
    options,
  ) as unknown;
}
