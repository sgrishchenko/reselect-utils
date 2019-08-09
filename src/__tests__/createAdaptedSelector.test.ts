import { createStructuredSelector } from 'reselect';
import createCachedSelector from 're-reselect';
import { Message, Person, commonState, State } from '../__data__/state';
import createAdaptedSelector from '../createAdaptedSelector';

describe('createAdaptedSelector', () => {
  const personSelector = (state: State, props: { id: number }) =>
    state.persons[props.id];
  const messageSelector = (state: State, props: { id: number }) =>
    state.messages[props.id];

  const personAdaptedSelector = createAdaptedSelector(
    personSelector,
    (props: { personId: number }) => ({
      id: props.personId,
    }),
  );
  const messageAdaptedSelector = createAdaptedSelector(
    messageSelector,
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

  const personAndMessageSelector = createStructuredSelector<
    State,
    PersonAndMessageProps,
    PersonAndMessage
  >({
    person: personAdaptedSelector,
    message: messageAdaptedSelector,
  });

  test('should implement adaptation of selector by mapping function', () => {
    const actual = personAndMessageSelector(commonState, {
      personId: 1,
      messageId: 100,
    });

    expect(actual.person.firstName).toBe('Marry');
    expect(actual.message.text).toBe('Hello');
  });

  describe('integration with re-reselect', () => {
    const fullNameCachedSelector = createCachedSelector(
      [personSelector],
      ({ firstName, secondName }) => `${firstName} ${secondName}`,
    )((state, props) => props.id);

    test('should decorate getMatchingSelector and removeMatchingSelector of dependency', () => {
      const fullNameAdaptedCachedSelector = createAdaptedSelector(
        fullNameCachedSelector,
        (props: { personId: number }) => ({
          id: props.personId,
        }),
      );

      const dependency: any = fullNameAdaptedCachedSelector.dependencies![0];

      let selectorInstance = dependency.getMatchingSelector(commonState, {
        personId: 1,
      });
      expect(selectorInstance).toBeUndefined();

      fullNameAdaptedCachedSelector(commonState, { personId: 1 });
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
});
