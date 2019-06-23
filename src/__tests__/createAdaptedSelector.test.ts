import { createStructuredSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { Message, Person, commonState, State } from '../__data__/state';
import createAdaptedSelector from '../createAdaptedSelector';
import CounterObjectCache from '../CounterObjectCache';

describe('createAdaptedSelector', () => {
  const getPerson = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const getMessage = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const adaptedGetPerson = createAdaptedSelector(
    getPerson,
    (props: { personId: number }) => ({
      id: props.personId,
    }),
  );
  const adaptedGetMessage = createAdaptedSelector(
    getMessage,
    (props: { messageId: number }) => ({
      id: props.messageId,
    }),
  );

  type PersonAndMessageProps = {
    personId: number;
    messageId: number;
  };

  type PersonAndMessage = {
    person: Person;
    message: Message;
  };

  const getPersonAndMessage = createStructuredSelector<
    State,
    PersonAndMessageProps,
    PersonAndMessage
  >({
    person: adaptedGetPerson,
    message: adaptedGetMessage,
  });

  test('should implement adaptation of selector by mapping function', () => {
    const actual = getPersonAndMessage(commonState, {
      personId: 1,
      messageId: 100,
    });

    expect(actual.person.firstName).toBe('Marry');
    expect(actual.message.text).toBe('Hello');
  });

  describe('integration with re-reselect', () => {
    const getCachedFullName = createCachedSelector(
      [getPerson],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id);

    test('should decorate getMatchingSelector and removeMatchingSelector of dependency', () => {
      const adaptedGetCachedFullName = createAdaptedSelector(
        getCachedFullName,
        (props: { personId: number }) => ({
          id: props.personId,
        }),
      );

      const dependency: any = adaptedGetCachedFullName.dependencies![0];

      let selectorInstance = dependency.getMatchingSelector(commonState, {
        personId: 1,
      });
      expect(selectorInstance).toBeUndefined();

      adaptedGetCachedFullName(commonState, { personId: 1 });
      selectorInstance = dependency.getMatchingSelector(commonState, {
        personId: 1,
      });
      expect(selectorInstance).toBeInstanceOf(Function);

      dependency.removeMatchingSelector(commonState, {
        personId: 1,
      });
      selectorInstance = dependency.getMatchingSelector(commonState, {
        personId: 1,
      });
      expect(selectorInstance).toBeUndefined();
    });
  });

  describe('integration with CounterObjectCache', () => {
    jest.useFakeTimers();

    afterAll(() => {
      jest.useRealTimers();
    });

    const getCachedFullName = createCachedSelector(
      [getPerson],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id, {
      cacheObject: new CounterObjectCache(),
    });

    test('should clear cache of dependency after removing ref', () => {
      const adaptedGetCachedFullName = createAdaptedSelector(
        getCachedFullName,
        (props: { personId: number }) => ({
          id: props.personId,
        }),
      );

      adaptedGetCachedFullName(commonState, { personId: 1 });
      CounterObjectCache.addRefRecursively(adaptedGetCachedFullName)(
        commonState,
        { personId: 1 },
      );
      expect(
        getCachedFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeDefined();

      CounterObjectCache.removeRefRecursively(adaptedGetCachedFullName)(
        commonState,
        { personId: 1 },
      );
      jest.runAllTimers();
      expect(
        getCachedFullName.getMatchingSelector(commonState, { id: 1 }),
      ).toBeUndefined();
    });
  });
});
