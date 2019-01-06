import createCachedSelector from "re-reselect";
import {state, State} from "../__data__/state";
import {removeMatchingSelectorRecursively} from "../removeMatchingSelectorRecursively"
import {once} from "../once";

jest.mock('../removeMatchingSelectorRecursively', () => ({
    removeMatchingSelectorRecursively: jest.fn(() => () => undefined)
}));

describe('once', () => {
    const getPerson = (state: State, props: { id: number }) => state.persons[props.id];

    const getFullName = createCachedSelector(
        [
            getPerson,
        ],
        ({firstName, secondName}) => `${firstName} ${secondName}`
    )((state, props) => props.id);

    test('should remove cached selector after using', () => {
        const actual = once(getFullName)(state, {id: 1});

        expect(actual).toBe('Marry Poppins');

        expect(removeMatchingSelectorRecursively).toHaveBeenCalledTimes(1);
        expect(removeMatchingSelectorRecursively).toHaveBeenCalledWith(getFullName)
    })
});