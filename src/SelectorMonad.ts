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

export type SelectorChain<R1, S, P, R2> =
  | ((result: R1) => Selector<S, R2>)
  | ((result: R1) => ParametricSelector<S, P, R2>);

export type SelectorChainHierarchy<
  C extends SelectorChain<any, any, any, any>,
  H extends SelectorChainHierarchy<any, any>
> = C & { parentChain?: H };

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

  private prevState?: S1;

  private prevProps?: P1;

  private prevResult?: R1;

  private cachedSelector?:
    | Selector<any, any>
    | ParametricSelector<any, any, any>;

  private readonly selector: SelectorType;

  private readonly prevChain?: SelectorChainType;

  private constructor(selector: SelectorType, prevChain?: SelectorChainType) {
    this.selector = selector;
    this.prevChain = prevChain;
  }

  public chain<S2, R2>(
    fn: (result: R1) => Selector<S2, R2>,
  ): SelectorType extends ParametricSelector<S1, P1, R1>
    ? SelectorMonad<
        S1 & S2,
        P1,
        R2,
        ParametricSelector<S1 & S2, P1, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >
    : SelectorMonad<
        S1 & S2,
        void,
        R2,
        Selector<S1 & S2, R2>,
        SelectorChainHierarchy<
          (result: R1) => Selector<S2, R2>,
          SelectorChainType
        >
      >;

  public chain<S2, P2, R2>(
    fn: (result: R1) => ParametricSelector<S2, P2, R2>,
  ): SelectorMonad<
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

      if (this.prevResult === undefined || this.prevResult !== newResult) {
        const newSelector = fn(newResult);

        if (
          this.cachedSelector !== undefined &&
          this.cachedSelector !== newSelector
        ) {
          CounterObjectCache.removeRefRecursively(this.cachedSelector)(
            this.prevState,
            this.prevProps,
          );
        }

        this.prevResult = newResult;
        this.cachedSelector = newSelector;
        this.prevState = state;
        this.prevProps = props;

        this.cachedSelector!.selectorName =
          this.cachedSelector!.selectorName ||
          this.cachedSelector!.name ||
          `derived from ${baseName} (${generateSelectorKey(
            this.cachedSelector,
          )})`;

        const dependencyName = this.cachedSelector!.selectorName;

        if (combinedSelector.selectorName.startsWith(baseName)) {
          combinedSelector.selectorName = `${baseName} (chained by ${dependencyName})`;
        }
        combinedSelector.dependencies = [
          this.selector,
          this.cachedSelector as SelectorType,
        ];
      }

      return this.cachedSelector!(state, props);
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
    return this.chain(result => () => fn(result));
  }

  public buildSelector() {
    return Object.assign(this.selector, {
      chainHierarchy: this.prevChain,
    });
  }
}
