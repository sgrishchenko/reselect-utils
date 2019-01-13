import { Selector, ParametricSelector } from './types';

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

export type SelectorChain = () =>
  | Selector<any, any>
  | ParametricSelector<any, any, any>;

export default class SelectorMonad<
  S1,
  P1,
  R1,
  SelectorType extends Selector<S1, R1> | ParametricSelector<S1, P1, R1>
> {
  public static of<S, R>(
    selector: Selector<S, R>,
  ): SelectorMonad<S, void, R, Selector<S, R>>;

  public static of<S, P, R>(
    selector: ParametricSelector<S, P, R>,
  ): SelectorMonad<S, P, R, ParametricSelector<S, P, R>>;

  public static of(selector: any) {
    return new SelectorMonad<any, any, any, any>(selector);
  }

  private prevResult?: R1;

  private cachedSelector?:
    | Selector<any, any>
    | ParametricSelector<any, any, any>;

  private readonly selector: SelectorType;

  private readonly prevChain: SelectorChain[];

  private constructor(selector: SelectorType, prevChain: SelectorChain[] = []) {
    this.selector = selector;
    this.prevChain = prevChain;
  }

  public chain<S2, R2>(
    fn: (result: R1) => Selector<S2, R2>,
  ): SelectorType extends ParametricSelector<S1, P1, R1>
    ? SelectorMonad<S1 & S2, P1, R2, ParametricSelector<S1 & S2, P1, R2>>
    : SelectorMonad<S1 & S2, void, R2, Selector<S1 & S2, R2>>;

  public chain<S2, P2, R2>(
    fn: (result: R1) => ParametricSelector<S2, P2, R2>,
  ): SelectorMonad<
    S1 & S2,
    P1 & P2,
    R2,
    ParametricSelector<S1 & S2, P1 & P2, R2>
  >;

  public chain(fn: any) {
    const baseName = this.selector.selectorName || this.selector.name;

    const combinedSelector = (state: any, props: any) => {
      const newState = this.selector(state, props);

      if (this.prevResult === undefined || this.prevResult !== newState) {
        this.prevResult = newState;
        this.cachedSelector = fn(newState);

        this.cachedSelector!.selectorName =
          this.cachedSelector!.selectorName ||
          this.cachedSelector!.name ||
          `derived from ${baseName} (${generateSelectorKey(
            this.cachedSelector,
          )})`;

        this.cachedSelector!.dependencies = [
          ...(this.cachedSelector!.dependencies || []),
          this.selector,
        ] as [];
      }

      const dependencyName = this.cachedSelector!.selectorName;

      if (combinedSelector.selectorName.startsWith(baseName)) {
        combinedSelector.selectorName = `${baseName} (chained by ${dependencyName})`;
      }
      combinedSelector.dependencies = [this.cachedSelector as SelectorType];

      return this.cachedSelector!(state, props);
    };

    combinedSelector.selectorName = `${baseName} (chained)`;
    combinedSelector.dependencies = [this.selector];

    return new SelectorMonad<any, any, any, any>(combinedSelector, [
      ...this.prevChain,
      fn,
    ]);
  }

  public buildSelector() {
    return Object.assign(this.selector, {
      resultChain: this.prevChain,
    });
  }
}
