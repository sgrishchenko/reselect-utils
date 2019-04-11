import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import SelectorMonad from '../SelectorMonad';
import createBoundSelector from '../createBoundSelector';
import createSequenceSelector from '../createSequenceSelector';
import CounterObjectCache from '../CounterObjectCache';
import { State, commonState } from '../__data__/state';
import createPathSelector from '../createPathSelector';

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
        createBoundSelector(getPerson, { id: message.personId }),
      )
      .chain(person => createBoundSelector(getFullName, { id: person.id }))
      .buildSelector();

    expect(getPersonByMessageId(commonState, { id: 100 })).toBe(
      'Marry Poppins',
    );
    expect(getPersonByMessageId(commonState, { id: 200 })).toBe('Harry Potter');
  });

  test('should implement aggregation for collection by single item selector', () => {
    const getPersons = (state: State) => state.persons;

    const getLongestFullName = SelectorMonad.of(getPersons)
      .chain(persons =>
        createSequenceSelector(
          Object.values(persons).map(person =>
            createBoundSelector(getFullName, { id: person.id }),
          ),
        ),
      )
      .map(fullNames =>
        fullNames.reduce((longest, current) =>
          current.length > longest.length ? current : longest,
        ),
      )
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
    const firstChain = () => firstSelector;

    type SecondState = { secondValue: number };
    type SecondProps = { prop: boolean };
    const secondSelector = (state: SecondState, props: SecondProps) =>
      `${state.secondValue} ${props.prop}`;
    const secondChain = () => secondSelector;

    const getSomeByMessageId = SelectorMonad.of(getMessage)
      .chain(firstChain)
      .chain(secondChain)
      .buildSelector();

    expect(getSomeByMessageId.chainHierarchy).toBeDefined();

    const lastChain = getSomeByMessageId.chainHierarchy!;
    expect(lastChain('firstValue')).toBe(secondSelector);
    expect(lastChain('firstValue')({ secondValue: 2 }, { prop: true })).toBe(
      '2 true',
    );

    const lastButOneChain = getSomeByMessageId.chainHierarchy!.parentChain!;
    expect(lastButOneChain(expect.anything())).toBe(firstSelector);
    expect(
      lastButOneChain(expect.anything())({ firstValue: 'firstValue' }),
    ).toBe('firstValue');
  });

  test('should not mutate dependencies of chaining selectors', () => {
    const getFirstPerson = createBoundSelector(getPerson, { id: 1 });

    const getMonadicFirstPerson = SelectorMonad.of(() => '')
      .chain(() => getFirstPerson)
      .buildSelector();

    const firstDependencies = getFirstPerson.dependencies;
    getMonadicFirstPerson(commonState);
    const secondDependencies = getFirstPerson.dependencies;

    expect(firstDependencies!.length).toBe(secondDependencies!.length);
  });

  describe('integration with re-reselect', () => {
    const getCachedFullName = createCachedSelector(
      [getPerson],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id);

    afterEach(() => {
      getCachedFullName.clearCache();
      getCachedFullName.resetRecomputations();
    });

    test('should not invalidate cache for input parametric selector', () => {
      const chainFn = jest.fn(result => () => result);
      const getCachedFullNameProxy = SelectorMonad.of(getCachedFullName)
        .chain(chainFn)
        .buildSelector();

      getCachedFullNameProxy(commonState, { id: 1 });
      getCachedFullNameProxy(commonState, { id: 2 });
      getCachedFullNameProxy(commonState, { id: 1 });
      getCachedFullNameProxy(commonState, { id: 2 });

      expect(getCachedFullName.recomputations()).toBe(2);
      expect(chainFn).toHaveBeenCalledTimes(2);
    });

    test('should not invalidate cache for input path parametric selector', () => {
      const getCachedPerson = createCachedSelector(
        [getPerson],
        person => person,
      )((state, props) => props.id);

      const chainFn = jest.fn(result => () => result);
      const getCachedNameProxy = SelectorMonad.of(
        createPathSelector(getCachedPerson).firstName(),
      )
        .chain(chainFn)
        .buildSelector();

      getCachedNameProxy(commonState, { id: 1 });
      getCachedNameProxy(commonState, { id: 2 });
      getCachedNameProxy(commonState, { id: 1 });
      getCachedNameProxy(commonState, { id: 2 });

      expect(chainFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration with CounterObjectCache', () => {
    const getCounterCachedFullName = createCachedSelector(
      [getPerson],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache(),
    });

    test('should remove references for unused selectors after switching dependencies', () => {
      jest.useFakeTimers();

      const getUseFullName = (state: {}, props: { useFullName: boolean }) =>
        props.useFullName;

      const getFullNameByProp = SelectorMonad.of(getUseFullName)
        .chain(useFullName =>
          useFullName ? getCounterCachedFullName : () => undefined,
        )
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
        getCounterCachedFullName.getMatchingSelector(commonState, initialProps),
      ).toBeUndefined();

      expect(
        getCounterCachedFullName.getMatchingSelector(commonState, nextProps),
      ).toBeUndefined();

      jest.useRealTimers();
    });
  });
});
