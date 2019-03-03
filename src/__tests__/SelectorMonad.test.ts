import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import SelectorMonad from '../SelectorMonad';
import createAdaptedSelector from '../createAdaptedSelector';
import CounterObjectCache from '../CounterObjectCache';
import { State, commonState, Message } from '../__data__/state';

describe('SelectorMonad', () => {
  const getPerson = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const getMessage = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const getFullName = createCachedSelector(
    [getPerson],
    ({ firstName, secondName }) => `${firstName} ${secondName}`,
  )((state, props) => props.id, {
    cacheObject: new CounterObjectCache(),
  });

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

  test('should build selector with chainHierarchy property for unit test', () => {
    type FirstState = { firstValue: string };
    const firstSelector = (state: FirstState) => state.firstValue;
    const firstChain = (message: Message) => firstSelector;

    type SecondState = { secondValue: number };
    type SecondProps = { prop: boolean };
    const secondSelector = (state: SecondState, prop: SecondProps) =>
      state.secondValue;
    const secondChain = (firstValue: string) => secondSelector;

    const getSomeByMessageId = SelectorMonad.of(getMessage)
      .chain(firstChain)
      .chain(secondChain)
      .buildSelector();

    expect(getSomeByMessageId.chainHierarchy).toBeDefined();

    const lastChain = getSomeByMessageId.chainHierarchy!;
    expect(lastChain('firstValue')).toBe(secondSelector);
    expect(lastChain('firstValue')({ secondValue: 2 }, { prop: true })).toBe(2);

    const lastButOneChain = getSomeByMessageId.chainHierarchy!.parentChain!;
    expect(lastButOneChain({} as Message)).toBe(firstSelector);
    expect(lastButOneChain({} as Message)({ firstValue: 'firstValue' })).toBe(
      'firstValue',
    );
  });

  test('should not mutate dependencies of chaining selectors', () => {
    const getFirstPerson = createAdaptedSelector(getPerson, { id: 1 });

    const getMonadicFirstPerson = SelectorMonad.of(() => '')
      .chain(() => getFirstPerson)
      .buildSelector();

    const firstDependencies = getFirstPerson.dependencies;
    getMonadicFirstPerson(commonState);
    const secondDependencies = getFirstPerson.dependencies;

    expect(firstDependencies!.length).toBe(secondDependencies!.length);
  });

  test('should remove references for unused selectors after switching dependencies', () => {
    jest.useFakeTimers();

    const getUseFullName = (state: {}, props: { useFullName: boolean }) =>
      props.useFullName;

    const getFullNameByProp = SelectorMonad.of(getUseFullName)
      .chain(useFullName => (useFullName ? getFullName : () => undefined))
      .buildSelector();

    const initialProps = { id: 1, useFullName: true };
    getFullNameByProp(commonState, initialProps);
    CounterObjectCache.addRefRecursively(getFullNameByProp)(
      commonState,
      initialProps,
    );

    const nextProps = { id: 1, useFullName: false };
    getFullNameByProp(commonState, nextProps);
    CounterObjectCache.removeRefRecursively(getFullNameByProp)(
      commonState,
      nextProps,
    );

    jest.runAllTimers();

    expect(
      getFullName.getMatchingSelector(commonState, { id: 1 }),
    ).toBeUndefined();

    jest.useRealTimers();
  });
});
