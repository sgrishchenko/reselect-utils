import { createStructuredSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { Message, Person, commonState, State } from '../__data__/state';
import createBoundSelector from '../createBoundSelector';
import CounterObjectCache from '../CounterObjectCache';

describe('createAdaptedSelector', () => {
  const personSelector = (state: State, props: { personId: number }) =>
    state.persons[props.personId];
  const messageSelector = (state: State, props: { messageId: number }) =>
    state.messages[props.messageId];

  type PersonAndMessageProps = {
    personId: number;
    messageId: number;
  };

  type PersonAndMessage = {
    person: Person;
    message: Message;
  };

  const personAndMessageSelector = createStructuredSelector<
    State,
    PersonAndMessageProps,
    PersonAndMessage
  >({
    person: personSelector,
    message: messageSelector,
  });

  test('should implement binding to partial props', () => {
    const marryAndMessageSelector = createBoundSelector(
      personAndMessageSelector,
      {
        personId: 1,
      },
    );

    const marryAndMessage = marryAndMessageSelector(commonState, {
      messageId: 100,
    });

    expect(marryAndMessage.person.firstName).toBe('Marry');
    expect(marryAndMessage.message.text).toBe('Hello');

    const personAndHelloSelector = createBoundSelector(
      personAndMessageSelector,
      {
        messageId: 100,
      },
    );

    const personAndHello = personAndHelloSelector(commonState, {
      personId: 1,
    });

    expect(personAndHello.person.firstName).toBe('Marry');
    expect(personAndHello.message.text).toBe('Hello');
  });

  test('should implement binding to full props', () => {
    const marryAndHelloSelector = createBoundSelector(
      personAndMessageSelector,
      {
        personId: 1,
        messageId: 100,
      },
    );

    const marryAndHello = marryAndHelloSelector(commonState);

    expect(marryAndHello.person.firstName).toBe('Marry');
    expect(marryAndHello.message.text).toBe('Hello');
  });

  describe('integration with re-reselect', () => {
    const fullNameCachedSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.personId);

    test('should decorate getMatchingSelector and removeMatchingSelector of dependency', () => {
      const marrySelector = createBoundSelector(fullNameCachedSelector, {
        personId: 1,
      });

      const dependency: any = marrySelector.dependencies![0];

      let selectorInstance = dependency.getMatchingSelector(commonState);
      expect(selectorInstance).toBeUndefined();

      marrySelector(commonState);
      selectorInstance = dependency.getMatchingSelector(commonState);
      expect(selectorInstance).toBeInstanceOf(Function);

      dependency.removeMatchingSelector(commonState);
      selectorInstance = dependency.getMatchingSelector(commonState);
      expect(selectorInstance).toBeUndefined();
    });
  });

  describe('integration with CounterObjectCache', () => {
    jest.useFakeTimers();

    afterAll(() => {
      jest.useRealTimers();
    });

    const fullNameCachedSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.personId, {
      cacheObject: new CounterObjectCache({ warnAboutUncontrolled: false }),
    });

    test('should clear cache of dependency after removing ref', () => {
      const marrySelector = createBoundSelector(fullNameCachedSelector, {
        personId: 1,
      });

      marrySelector(commonState);
      CounterObjectCache.addRefRecursively(marrySelector)(commonState, {});
      expect(
        fullNameCachedSelector.getMatchingSelector(commonState, {
          personId: 1,
        }),
      ).toBeDefined();

      CounterObjectCache.removeRefRecursively(marrySelector)(commonState, {});
      jest.runAllTimers();
      expect(
        fullNameCachedSelector.getMatchingSelector(commonState, {
          personId: 1,
        }),
      ).toBeUndefined();
    });
  });
});
