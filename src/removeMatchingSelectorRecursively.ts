import {OutputParametricCachedSelector} from 're-reselect'

export const removeMatchingSelectorRecursively = <S, P, R>(
    selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>
) => (state: S, props: P) => {

    if (typeof selector.removeMatchingSelector === 'function') {
        selector.removeMatchingSelector(state, props)
    }

    if (Array.isArray((selector as any).dependencies)) {
        (selector as any).dependencies
            .forEach((dep: any) => {
                removeMatchingSelectorRecursively(dep)(state, props)
            })
    }
};