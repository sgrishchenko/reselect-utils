import {OutputParametricCachedSelector} from 're-reselect'
import {removeMatchingSelectorRecursively} from './removeMatchingSelectorRecursively'

export const once = <S, P, R>(
    selector: ReturnType<OutputParametricCachedSelector<S, P, R, any>>
) => (state: S, props: P) => {

    const matchingSelector = selector.getMatchingSelector(state, props);
    removeMatchingSelectorRecursively(selector)(state, props);

    return matchingSelector(state, props)
};