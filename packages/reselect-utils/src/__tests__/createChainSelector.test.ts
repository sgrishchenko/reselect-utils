import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { createChainSelector } from '../createChainSelector';
import { createBoundSelector } from '../createBoundSelector';
import { createSequenceSelector } from '../createSequenceSelector';
import { State, commonState } from '../__data__/state';
import { createPathSelector } from '../createPathSelector';

describe('createChainSelector', () => {
  const personSelector = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const messageSelector = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const fullNameSelector = createSelector(
    [personSelector],
    ({ firstName, secondName }) => `${firstName} ${secondName}`,
  );

  test('should implement simple selector chain', () => {
    const personByMessageIdSelector = createChainSelector(messageSelector)
      .chain(message =>
        createBoundSelector(personSelector, { id: message.personId }),
      )
      .chain(person => createBoundSelector(fullNameSelector, { id: person.id }))
      .build();

    expect(personByMessageIdSelector(commonState, { id: 100 })).toBe(
      'Marry Poppins',
    );
    expect(personByMessageIdSelector(commonState, { id: 200 })).toBe(
      'Harry Potter',
    );
  });

  test('should implement aggregation for collection by single item selector', () => {
    const personsSelector = (state: State) => state.persons;

    const longestFullNameSelector = createChainSelector(personsSelector)
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
      .build();

    expect(longestFullNameSelector(commonState)).toBe('Marry Poppins');
  });

  test('should cached chain callback by result of input selector', () => {
    const selectorStub = () => '';
    const chainMock = jest.fn(() => selectorStub);

    const someByMessageIdSelector = createChainSelector(messageSelector)
      .chain(chainMock)
      .build();

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

    const someByMessageIdSelector = createChainSelector(messageSelector)
      .chain(firstChain)
      .chain(secondChain)
      .build();

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

    const firstPersonMonadicSelector = createChainSelector(() => '')
      .chain(() => firstPersonSelector)
      .build();

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
      const fullNameProxyCachedSelector = createChainSelector(
        fullNameCachedSelector,
      )
        .chain(chainFn)
        .build();

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
      const nameProxyCachedSelector = createChainSelector(
        createPathSelector(personCachedSelector).firstName(),
      )
        .chain(chainFn)
        .build();

      nameProxyCachedSelector(commonState, { id: 1 });
      nameProxyCachedSelector(commonState, { id: 2 });
      nameProxyCachedSelector(commonState, { id: 1 });
      nameProxyCachedSelector(commonState, { id: 2 });

      expect(chainFn).toHaveBeenCalledTimes(2);
    });
  });
});
