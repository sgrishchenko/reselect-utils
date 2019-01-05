import {ParametricSelector, Selector} from "./types";

export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>

export function createAdaptedSelector<S, P1, P2, R>(
    baseSelector: ParametricSelector<S, P1, R>,
    mapping: (props: P1) => P2
): ParametricSelector<S, P2, R>

export function createAdaptedSelector<S, P1, P2 extends Partial<P1>, R>(
    baseSelector: ParametricSelector<S, P1, R>,
    binding: P2
): Exclude<keyof P1, keyof P2> extends never
    ? Selector<S, R>
    : ParametricSelector<S, Diff<P1, P2>, R>

export function createAdaptedSelector<S, P, R>(baseSelector: any, mappingOrBinding: any) {
    if (typeof mappingOrBinding === "function") {
        const mapping = mappingOrBinding;

        return (state: S, props: P) => baseSelector(state, mapping(props))
    }

    const binding = mappingOrBinding;

    return (state: S, props: P) => baseSelector(state, {
        ...(props || {}),
        ...(binding || {}),
    })
}