import { createSelector } from 'reselect';
import SelectorMonad from '../SelectorMonad';
import createAdaptedSelector from '../createAdaptedSelector';
import { State, commonState } from '../__data__/state';

describe('SelectorMonad', () => {
  const getPerson = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const getMessage = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const getFullName = createSelector(
    [getPerson],
    ({ firstName, secondName }) => `${firstName} ${secondName}`,
  );

  test('should implement simple selector chain', () => {
    const getPersonByMessageId = SelectorMonad.of(getMessage)
      .chain(message =>
        createAdaptedSelector(getPerson, { id: message.personId }),
      )
      .chain(person => createAdaptedSelector(getFullName, { id: person.id }))
      .buildSelector();

    expect(getPersonByMessageId(commonState, { id: 100 })).toBe(
      'Marry Poppins',
    );
    expect(getPersonByMessageId(commonState, { id: 200 })).toBe('Harry Potter');
  });

  test('should implement aggregation for collection by single item selector', () => {
    const getPersons = (state: State) => state.persons;

    const getLongestFullName = SelectorMonad.of(getPersons)
      .chain(persons => {
        const dependencies = Object.values(persons).map(person =>
          createAdaptedSelector(getFullName, { id: person.id }),
        );

        return createSelector(
          dependencies,
          (...fullNames) =>
            fullNames.reduce((longest, current) =>
              current.length > longest.length ? current : longest,
            ),
        );
      })
      .buildSelector();

    expect(getLongestFullName(commonState)).toBe('Marry Poppins');
  });

  test('should cached chain callback by result of input selector', () => {
    const selectorStub = () => '';
    const chainMock = jest.fn(() => selectorStub);

    const getSomeByMessageId = SelectorMonad.of(getMessage)
      .chain(chainMock)
      .buildSelector();

    getSomeByMessageId(commonState, { id: 100 });
    getSomeByMessageId(commonState, { id: 100 });
    getSomeByMessageId(commonState, { id: 100 });
    expect(chainMock).toHaveBeenCalledTimes(1);

    getSomeByMessageId(commonState, { id: 200 });
    expect(chainMock).toHaveBeenCalledTimes(2);
  });

  test('should build selector with resultChain property for unit test', () => {
    const firstSelector = () => 'firstChain';
    const firstChain = () => firstSelector;
    const secondSelector = () => () => 'secondChain';
    const secondChain = () => secondSelector;

    const getSomeByMessageId = SelectorMonad.of(getMessage)
      .chain(firstChain)
      .chain(secondChain)
      .buildSelector();

    expect(getSomeByMessageId.resultChain).toBeDefined();
    expect(getSomeByMessageId.resultChain[0]).toBe(firstChain);
    expect(getSomeByMessageId.resultChain[0]()).toBe(firstSelector);
    expect(getSomeByMessageId.resultChain[1]).toBe(secondChain);
    expect(getSomeByMessageId.resultChain[1]()).toBe(secondSelector);
  });
});
