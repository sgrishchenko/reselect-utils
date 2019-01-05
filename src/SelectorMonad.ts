import {Selector, ParametricSelector} from "./types";

export default class SelectorMonad<S1, P1, R1, SelectorType extends Selector<S1, R1> | ParametricSelector<S1, P1, R1>> {

    static of<S, R>(
        selector: Selector<S, R>
    ): SelectorMonad<S, void, R, Selector<S, R>>

    static of<S, P, R>(
        selector: ParametricSelector<S, P, R>
    ): SelectorMonad<S, P, R, ParametricSelector<S, P, R>>

    static of(selector: any) {
        return new SelectorMonad<any, any, any, any>(selector)
    }

    private prevResult?: R1;
    private cachedSelector?: Selector<any, any> | ParametricSelector<any, any, any>;

    private constructor(private selector: SelectorType) {
    }

    chain<S2, R2>(
        fn: (result: R1) => Selector<S2, R2>
    ): SelectorType extends ParametricSelector<S1, P1, R1>
        ? SelectorMonad<S1 & S2, P1, R2, ParametricSelector<S1 & S2, P1, R2>>
        : SelectorMonad<S1 & S2, void, R2, Selector<S1 & S2, R2>>

    chain<S2, P2, R2>(
        fn: (result: R1) => ParametricSelector<S2, P2, R2>
    ): SelectorMonad<S1 & S2, P1 & P2, R2, ParametricSelector<S1 & S2, P1 & P2, R2>>

    chain(fn: any) {
        const combinedSelector = (state: any, props: any) => {
            const newState = this.selector(state, props);

            if (this.prevResult === undefined
                || this.prevResult !== newState) {

                this.prevResult = newState;
                this.cachedSelector = fn(newState)
            }

            return this.cachedSelector!(state, props)
        };

        return new SelectorMonad<any, any, any, any>(combinedSelector)
    }

    buildSelector() {
        return this.selector
    }
}
