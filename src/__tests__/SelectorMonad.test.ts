import { createSelector } from 'reselect';
import SelectorMonad from '../SelectorMonad';
import {createAdaptedSelector} from '../createAdaptedSelector';
import {State, state} from '../__data__/state';


describe('SelectorMonad', () => {
    const getPerson = (state: State, props: { id: number }) => state.persons[props.id];
    const getMessage = (state: State, props: { id: number }) => state.messages[props.id];

    const getFullName = createSelector(
        [
            getPerson,
        ],
        ({firstName, secondName}) => `${firstName} ${secondName}`
    );

    test('should implement simple selector chain', () => {
        const getPersonByMessageId = SelectorMonad.of(getMessage)
            .chain(message => (
                createAdaptedSelector(getPerson, {id: message.personId}))
            )
            .chain(person => (
                createAdaptedSelector(getFullName, {id: person.id}))
            )
            .buildSelector();

        expect(getPersonByMessageId(state, { id: 100 })).toBe('Marry Poppins');
        expect(getPersonByMessageId(state, { id: 200 })).toBe('Harry Potter');
    });

    test('should implement aggregation for collection by single item selector', () => {
        const getPersons = (state: State) => state.persons;

        const getLongestFullName =
            SelectorMonad.of(getPersons)
                .chain(persons => {
                    const dependencies = Object.values(persons).map(person => (
                        createAdaptedSelector(getFullName, { id: person.id }))
                    );

                    return createSelector(
                        dependencies,
                        (...fullNames) => fullNames
                            .reduce((longest, current) => (
                                current.length > longest.length
                                    ? current
                                    : longest
                            ))
                    );
                })
                .buildSelector();

        expect(getLongestFullName(state)).toBe('Marry Poppins');
    })
});
