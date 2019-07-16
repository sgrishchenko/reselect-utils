import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import SelectorMonad from '../SelectorMonad';
import createBoundSelector from '../createBoundSelector';
import createSequenceSelector from '../createSequenceSelector';
import CounterObjectCache from '../CounterObjectCache';
import { commonState, State } from '../__data__/state';
import createPathSelector from '../createPathSelector';

describe('SelectorMonad', () => {
  const personSelector = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const messageSelector = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const fullNameSelector = createSelector(
    [personSelector],
    ({ firstName, secondName }) => `${firstName} ${secondName}`,
  );

  test('should implement simple selector chain', () => {
    const personByMessageIdSelector = SelectorMonad.of(messageSelector)
      .chain(message =>
        createBoundSelector(personSelector, { id: message.personId }),
      )
      .chain(person => createBoundSelector(fullNameSelector, { id: person.id }))
      .buildSelector();

    expect(personByMessageIdSelector(commonState, { id: 100 })).toBe(
      'Marry Poppins',
    );
    expect(personByMessageIdSelector(commonState, { id: 200 })).toBe(
      'Harry Potter',
    );
  });

  test('should implement aggregation for collection by single item selector', () => {
    const personsSelector = (state: State) => state.persons;

    const longestFullNameSelector = SelectorMonad.of(personsSelector)
      .chain(persons =>
        createSequenceSelector(
          Object.values(persons).map(person =>
            createBoundSelector(fullNameSelector, { id: person.id }),
          ),
        ),
      )
      .map(fullNames =>
        fullNames.reduce((longest, current) =>
          current.length > longest.length ? current : longest,
        ),
      )
      .buildSelector();

    expect(longestFullNameSelector(commonState)).toBe('Marry Poppins');
  });

  test('should cached chain callback by result of input selector', () => {
    const selectorStub = () => '';
    const chainMock = jest.fn(() => selectorStub);

    const someByMessageIdSelector = SelectorMonad.of(messageSelector)
      .chain(chainMock)
      .buildSelector();

    someByMessageIdSelector(commonState, { id: 100 });
    someByMessageIdSelector(commonState, { id: 100 });
    someByMessageIdSelector(commonState, { id: 100 });
    expect(chainMock).toHaveBeenCalledTimes(1);

    someByMessageIdSelector(commonState, { id: 200 });
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

    const someByMessageIdSelector = SelectorMonad.of(messageSelector)
      .chain(firstChain)
      .chain(secondChain)
      .buildSelector();

    expect(someByMessageIdSelector.chainHierarchy).toBeDefined();

    const lastChain = someByMessageIdSelector.chainHierarchy!;
    expect(lastChain('firstValue')).toBe(secondSelector);
    expect(lastChain('firstValue')({ secondValue: 2 }, { prop: true })).toBe(
      '2 true',
    );

    const lastButOneChain = someByMessageIdSelector.chainHierarchy!
      .parentChain!;
    expect(lastButOneChain(expect.anything())).toBe(firstSelector);
    expect(
      lastButOneChain(expect.anything())({ firstValue: 'firstValue' }),
    ).toBe('firstValue');
  });

  test('should not mutate dependencies of chaining selectors', () => {
    const firstPersonSelector = createBoundSelector(personSelector, { id: 1 });

    const firstPersonMonadicSelector = SelectorMonad.of(() => '')
      .chain(() => firstPersonSelector)
      .buildSelector();

    const firstDependencies = firstPersonSelector.dependencies;
    firstPersonMonadicSelector(commonState);
    const secondDependencies = firstPersonSelector.dependencies;

    expect(firstDependencies!.length).toBe(secondDependencies!.length);
  });

  describe('integration with re-reselect', () => {
    const fullNameCachedSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id);

    afterEach(() => {
      fullNameCachedSelector.clearCache();
      fullNameCachedSelector.resetRecomputations();
    });

    test('should not invalidate cache for input parametric selector', () => {
      const chainFn = jest.fn(result => () => result);
      const fullNameProxyCachedSelector = SelectorMonad.of(
        fullNameCachedSelector,
      )
        .chain(chainFn)
        .buildSelector();

      fullNameProxyCachedSelector(commonState, { id: 1 });
      fullNameProxyCachedSelector(commonState, { id: 2 });
      fullNameProxyCachedSelector(commonState, { id: 1 });
      fullNameProxyCachedSelector(commonState, { id: 2 });

      expect(fullNameCachedSelector.recomputations()).toBe(2);
      expect(chainFn).toHaveBeenCalledTimes(2);
    });

    test('should not invalidate cache for input path parametric selector', () => {
      const personCachedSelector = createCachedSelector(
        [personSelector],
        person => person,
      )((state, props) => props.id);

      const chainFn = jest.fn(result => () => result);
      const nameProxyCachedSelector = SelectorMonad.of(
        createPathSelector(personCachedSelector).firstName(),
      )
        .chain(chainFn)
        .buildSelector();

      nameProxyCachedSelector(commonState, { id: 1 });
      nameProxyCachedSelector(commonState, { id: 2 });
      nameProxyCachedSelector(commonState, { id: 1 });
      nameProxyCachedSelector(commonState, { id: 2 });

      expect(chainFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('integration with CounterObjectCache', () => {
    const counterCachedFullNameSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache(),
    });

    test('should remove references for unused selectors after switching dependencies', () => {
      jest.useFakeTimers();

      const useFullNameSelector = (
        state: {},
        props: { useFullName: boolean },
      ) => props.useFullName;

      const fullNameByPropSelector = SelectorMonad.of(useFullNameSelector)
        .chain(useFullName =>
          useFullName ? counterCachedFullNameSelector : () => undefined,
        )
        .buildSelector();

      const initialProps = { id: 1, useFullName: true };
      fullNameByPropSelector(commonState, initialProps);

      CounterObjectCache.confirmValidAccessRecursively(fullNameByPropSelector)(
        commonState,
        initialProps,
      );
      CounterObjectCache.addRefRecursively(fullNameByPropSelector)(
        commonState,
        initialProps,
      );

      const nextProps = { id: 1, useFullName: false };
      fullNameByPropSelector(commonState, nextProps);

      CounterObjectCache.removeRefRecursively(fullNameByPropSelector)(
        commonState,
        nextProps,
      );

      jest.runAllTimers();

      expect(
        counterCachedFullNameSelector.getMatchingSelector(
          commonState,
          initialProps,
        ),
      ).toBeUndefined();

      expect(
        counterCachedFullNameSelector.getMatchingSelector(
          commonState,
          nextProps,
        ),
      ).toBeUndefined();

      jest.useRealTimers();
    });

    test('should decrease count of warning timeout pool in matching selector', () => {
      const messageCachedSelector = createCachedSelector(
        [messageSelector],
        message => message,
      )((state, props) => props.id, { cacheObject: new CounterObjectCache() });

      const personCachedSelector = createCachedSelector(
        [personSelector],
        person => person,
      )((state, props) => props.id, { cacheObject: new CounterObjectCache() });

      const nameProxyCachedSelector = SelectorMonad.of(
        createPathSelector(messageCachedSelector).personId(),
      )
        .chain(personId => {
          return createBoundSelector(personCachedSelector, {
            id: personId,
          });
        })
        .buildSelector();

      nameProxyCachedSelector(commonState, { id: 100 });

      expect(
        (messageCachedSelector.cache as any).warningTimeoutPool.length,
      ).toBe(1);
      expect(
        (personCachedSelector.cache as any).warningTimeoutPool.length,
      ).toBe(1);
    });
  });
});
