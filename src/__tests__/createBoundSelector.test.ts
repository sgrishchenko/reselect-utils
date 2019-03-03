import { createStructuredSelector } from 'reselect';
import { Message, Person, commonState, State } from '../__data__/state';
import createBoundSelector from '../createBoundSelector';

describe('createAdaptedSelector', () => {
  const getPerson = (state: State, props: { personId: number }) =>
    state.persons[props.personId];
  const getMessage = (state: State, props: { messageId: number }) =>
    state.messages[props.messageId];

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
    person: getPerson,
    message: getMessage,
  });

  test('should implement binding to partial props', () => {
    const getMarryAndMessage = createBoundSelector(getPersonAndMessage, {
      personId: 1,
    });

    const marryAndMessage = getMarryAndMessage(commonState, {
      messageId: 100,
    });

    expect(marryAndMessage.person.firstName).toBe('Marry');
    expect(marryAndMessage.message.text).toBe('Hello');

    const getPersonAndHello = createBoundSelector(getPersonAndMessage, {
      messageId: 100,
    });

    const personAndHello = getPersonAndHello(commonState, {
      personId: 1,
    });

    expect(personAndHello.person.firstName).toBe('Marry');
    expect(personAndHello.message.text).toBe('Hello');
  });

  test('should implement binding to full props', () => {
    const getMarryAndHello = createBoundSelector(getPersonAndMessage, {
      personId: 1,
      messageId: 100,
    });

    const marryAndHello = getMarryAndHello(commonState);

    expect(marryAndHello.person.firstName).toBe('Marry');
    expect(marryAndHello.message.text).toBe('Hello');
  });
});
