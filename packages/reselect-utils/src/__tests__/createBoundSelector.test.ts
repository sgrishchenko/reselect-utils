import createCachedSelector from 're-reselect';
import { commonState, State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createStructuredSelector } from '../createStructuredSelector';
import { NamedParametricSelector } from '../types';

describe('createAdaptedSelector', () => {
  const personSelector = (state: State, props: { personId: number }) =>
    state.persons[props.personId];
  const messageSelector = (state: State, props: { messageId: number }) =>
    state.messages[props.messageId];

  const personAndMessageSelector = createStructuredSelector({
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

  test('should generate selector name', () => {
    const marrySelector = createBoundSelector(personSelector, {
      personId: 1,
    });
    expect(marrySelector.selectorName).toMatchInlineSnapshot(
      `"personSelector (personId -> [*])"`,
    );

    const helloSelector = createBoundSelector(messageSelector, {
      messageId: 100,
    });
    expect(helloSelector.selectorName).toMatchInlineSnapshot(
      `"messageSelector (messageId -> [*])"`,
    );

    const personAndMessageNamedSelector = createStructuredSelector({
      person: personSelector,
      message: messageSelector,
    });
    (personAndMessageNamedSelector as NamedParametricSelector<
      unknown,
      unknown,
      unknown
    >).selectorName = 'personAndMessageNamedSelector';

    const marryAndHelloSelector = createBoundSelector(
      personAndMessageNamedSelector,
      {
        personId: 1,
        messageId: 100,
      },
    );

    expect(marryAndHelloSelector.selectorName).toMatchInlineSnapshot(
      `"personAndMessageNamedSelector (personId,messageId -> [*],[*])"`,
    );
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

      const dependency = marrySelector.dependencies?.[0];

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
});
