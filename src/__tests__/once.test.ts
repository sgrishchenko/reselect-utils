import createCachedSelector from "re-reselect";
import {state, State} from "../__data__/state";
import CounterObjectCache from "../CounterObjectCache"
import {once} from "../once";

jest.useFakeTimers();

describe('once', () => {
    const getPerson = (state: State, props: { id: number }) => state.persons[props.id];

    const getFullName = createCachedSelector(
        [
            getPerson,
        ],
        ({firstName, secondName}) => `${firstName} ${secondName}`
    )((state, props) => props.id, {
        cacheObject: new CounterObjectCache()
    });

    test('should remove cached selector after using', () => {
        const actual = once(getFullName)(state, {id: 1});

        expect(actual).toBe('Marry Poppins');
        jest.runAllTimers();

        expect(getFullName.getMatchingSelector(state, {id: 1})).toBeUndefined()
    })
});