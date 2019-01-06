import createCachedSelector from "re-reselect";
import {state, State} from "../__data__/state";
import {removeMatchingSelectorRecursively} from "../removeMatchingSelectorRecursively"

describe('removeMatchingSelectorRecursively', () => {
    const getPerson = createCachedSelector(
        [
            (state: State) => state.persons,
            (state: State, props: { id: number }) => props.id,
        ],
        (persons, id) => persons[id]
    )((state, props) => props.id);

    const getFullName = createCachedSelector(
        [
            getPerson,
        ],
        ({firstName, secondName}) => `${firstName} ${secondName}`
    )((state, props) => props.id);

    afterEach(() => {
        getPerson.clearCache();
        getFullName.clearCache();
    });

    test('should remove cached selector', () => {
        getFullName(state, {id: 1});

        expect(getFullName.getMatchingSelector(state, {id: 1})).toBeDefined();

        removeMatchingSelectorRecursively(getFullName)(state, {id: 1});

        expect(getFullName.getMatchingSelector(state, {id: 1})).toBeUndefined()
    });

    test('should remove cached selector for dependencies', () => {
        getFullName(state, {id: 1});

        expect(getPerson.getMatchingSelector(state, {id: 1})).toBeDefined();
        expect(getFullName.getMatchingSelector(state, {id: 1})).toBeDefined();

        removeMatchingSelectorRecursively(getFullName)(state, {id: 1});

        expect(getPerson.getMatchingSelector(state, {id: 1})).toBeUndefined();
        expect(getFullName.getMatchingSelector(state, {id: 1})).toBeUndefined();
    })
});