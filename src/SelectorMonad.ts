import { OutputParametricCachedSelector } from 're-reselect';
import { Selector, ParametricSelector } from './types';
import CounterObjectCache from './CounterObjectCache';

const sumString = (stringSource: object): number =>
  Array.from(stringSource.toString()).reduce(
    (sum, char) => char.charCodeAt(0) + sum,
    0,
  );

const generateSelectorKey = (selector: any) =>
  (selector.dependencies || []).reduce(
    (base: number, dependency: any) => base + sumString(dependency),
    sumString(selector),
  );

const tryExtractCachedSelector = (
  selector:
    | ParametricSelector<any, any, any>
    | ReturnType<OutputParametricCachedSelector<any, any, any, any, any>>,
):
  | ReturnType<OutputParametricCachedSelector<any, any, any, any, any>>
  | undefined => {
  if ('getMatchingSelector' in selector) {
    return selector;
  }
  if (selector.dependencies && selector.dependencies.length === 1) {
    // adaptedSelector, boundSelector and pathSelector cases
    const [dependency] = selector.dependencies;
    return tryExtractCachedSelector(dependency);
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

export type CacheContainer<S, P, R> = {
  prevState?: S;

  prevProps?: P;

  prevResult?: R;

  cachedSelector?: Selector<any, any> | ParametricSelector<any, any, any>;
};

export default class SelectorMonad<
  S1,
  P1,
  R1,
  SelectorType extends Selector<S1, R1> | ParametricSelector<S1, P1, R1>,
  SelectorChainType extends SelectorChainHierarchy<any, any>
> {
  public static of<S, R>(
    selector: Selector<S, R>,
  ): SelectorMonad<S, void, R, Selector<S, R>, void>;

  public static of<S, P, R>(
    selector: ParametricSelector<S, P, R>,
  ): SelectorMonad<S, P, R, ParametricSelector<S, P, R>, void>;

  public static of(selector: any) {
    return new SelectorMonad<any, any, any, any, void>(selector);
  }

  private cacheContainer: CacheContainer<S1, P1, R1> = {};

  private cacheContainerSymbol = Symbol('Selector Monad Cache Container');

  private readonly selector: SelectorType;

  private readonly prevChain?: SelectorChainType;

  private constructor(selector: SelectorType, prevChain?: SelectorChainType) {
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
    const baseName = this.selector.selectorName || this.selector.name;

    const combinedSelector = (state: any, props: any) => {
      const newResult = this.selector(state, props);
      const cacheContainer = this.resolveCacheContainer(state, props);
      const {
        prevState,
        prevProps,
        prevResult,
        cachedSelector,
      } = cacheContainer;

      if (prevResult === undefined || prevResult !== newResult) {
        const newSelector = fn(newResult);

        if (cachedSelector !== undefined && cachedSelector !== newSelector) {
          CounterObjectCache.removeRefRecursively(cachedSelector)(
            prevState,
            prevProps,
          );
        }

        cacheContainer.prevResult = newResult;
        cacheContainer.cachedSelector = newSelector;
        cacheContainer.prevState = state;
        cacheContainer.prevProps = props;

        cacheContainer.cachedSelector!.selectorName =
          cacheContainer.cachedSelector!.selectorName ||
          cacheContainer.cachedSelector!.name ||
          `derived from ${baseName} (${generateSelectorKey(
            cacheContainer.cachedSelector,
          )})`;

        const dependencyName = cacheContainer.cachedSelector!.selectorName;

        if (combinedSelector.selectorName.startsWith(baseName)) {
          combinedSelector.selectorName = `${baseName} (chained by ${dependencyName})`;
        }
        combinedSelector.dependencies = [
          this.selector,
          cacheContainer.cachedSelector as SelectorType,
        ];
      }

      return cacheContainer.cachedSelector!(state, props);
    };

    combinedSelector.selectorName = `${baseName} (chained)`;
    combinedSelector.dependencies = [this.selector];

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

  public buildSelector() {
    return Object.assign(this.selector, {
      chainHierarchy: this.prevChain,
    });
  }

  private resolveCacheContainer(
    state: S1,
    props: P1,
  ): CacheContainer<S1, P1, R1> {
    const cachedSelector = tryExtractCachedSelector(this.selector);

    if (cachedSelector) {
      const selectorInstance: any = cachedSelector.getMatchingSelector(
        state,
        props,
      );

      if (cachedSelector.cache instanceof CounterObjectCache) {
        cachedSelector.cache.confirmValidAccess();
      }

      if (selectorInstance) {
        if (!selectorInstance[this.cacheContainerSymbol]) {
          selectorInstance[this.cacheContainerSymbol] = {};
        }

        return selectorInstance[this.cacheContainerSymbol];
      }
    }
    return this.cacheContainer;
  }
}
