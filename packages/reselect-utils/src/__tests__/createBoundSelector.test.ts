import createCachedSelector from 're-reselect';
import { commonState, State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createStructuredSelector } from '../createStructuredSelector';
import { NamedParametricSelector } from '../types';
import { defaultKeySelector, isCachedSelector } from '../helpers';
import { createPropSelector } from '../createPropSelector';
import { isComposedKeySelector } from '../createKeySelectorComposer';
import { stringComposeKeySelectors } from '../stringComposeKeySelectors';

describe('createBoundSelector', () => {
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

  test('should not support binding of optional values to non-optional props', () => {
    type Props = {
      first: string;
      second?: string;
    };

    type WrongProps = {
      first?: string;
    };

    const wrongProps: WrongProps = {};

    const selector = (state: State, props: Props) =>
      JSON.stringify(state) + JSON.stringify(props);

    const boundSelector: never = createBoundSelector(selector, wrongProps);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    boundSelector(commonState, {});
  });

  test('should support binding of non-optional values to optional props', () => {
    type Props = {
      first: string;
      second?: string;
    };

    type RightProps = {
      second: string;
    };

    const rightProps: RightProps = {
      second: 'second',
    };

    const selector = (state: State, props: Props) =>
      JSON.stringify(state) + JSON.stringify(props);

    const boundSelector = createBoundSelector(selector, rightProps);

    expect(boundSelector(commonState, { first: 'first' })).toBeDefined();
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
      ({ firstName = '', secondName = '' }) => `${firstName} ${secondName}`,
    )((state, props) => props.personId);

    test('should decorate getMatchingSelector and removeMatchingSelector of dependency', () => {
      const marrySelector = createBoundSelector(fullNameCachedSelector, {
        personId: 1,
      });

      if (!isCachedSelector(marrySelector)) {
        throw new Error('marrySelector should be cached');
      }

      let selectorInstance = marrySelector.getMatchingSelector?.(
        commonState,
        expect.anything(),
      );
      expect(selectorInstance).toBeUndefined();

      marrySelector(commonState);
      selectorInstance = marrySelector.getMatchingSelector?.(
        commonState,
        expect.anything(),
      );
      expect(selectorInstance).toBeInstanceOf(Function);

      // eslint-disable-next-line no-unused-expressions
      marrySelector.removeMatchingSelector?.(commonState, expect.anything());
      selectorInstance = marrySelector.getMatchingSelector?.(
        commonState,
        expect.anything(),
      );
      expect(selectorInstance).toBeUndefined();

      const key = marrySelector.keySelector(
        commonState,
        expect.anything(),
      ) as unknown;
      expect(key).toBe(1);
    });

    test('should return key without keys which selectors are bounded', () => {
      const firstPropSelector = createPropSelector<{
        value1: number;
      }>().value1();
      const secondPropSelector = createPropSelector<{
        value2: number;
      }>().value2();
      const thirdPropSelector = createPropSelector<{
        value3: number;
      }>().value3();
      const fourthPropSelector = createPropSelector<{
        value4: number;
      }>().value4();

      const selector = createCachedSelector([], () => {})({
        keySelector: stringComposeKeySelectors(
          firstPropSelector,
          secondPropSelector,
          thirdPropSelector,
          fourthPropSelector,
        ),
      });

      const boundSelector = createBoundSelector(selector, {
        value1: 1,
        value4: 4,
      });

      if (!isCachedSelector(boundSelector)) {
        throw new Error('selector should be cached');
      }

      const { keySelector } = boundSelector;

      const key = keySelector(commonState, {
        value2: 2,
        value3: 3,
      }) as unknown;

      expect(key).toBe('2:3');
    });
  });

  test('should return default key selector if all selectors are bounded', () => {
    const firstPropSelector = createPropSelector<{ value1: number }>().value1();
    const secondPropSelector = createPropSelector<{
      value2: number;
    }>().value2();

    const selector = createCachedSelector([], () => {})({
      keySelector: stringComposeKeySelectors(
        firstPropSelector,
        secondPropSelector,
      ),
    });

    const boundSelector = createBoundSelector(selector, {
      value1: 1,
      value2: 2,
    });

    if (!isCachedSelector(boundSelector)) {
      throw new Error('selector should be cached');
    }

    const { keySelector } = boundSelector;

    expect(keySelector).toBe(defaultKeySelector);
  });

  test('should exclude default key selector from result key selector', () => {
    const firstPropSelector = createPropSelector<{ value1: number }>().value1();
    const secondPropSelector = createPropSelector<{
      value2: number;
    }>().value2();

    const selector = createCachedSelector([], () => {})({
      keySelector: stringComposeKeySelectors(
        firstPropSelector,
        secondPropSelector,
        defaultKeySelector,
      ),
    });

    const boundSelector = createBoundSelector(selector, {
      value3: 3,
    });

    if (!isCachedSelector(boundSelector)) {
      throw new Error('selector should be cached');
    }

    const { keySelector } = boundSelector;

    const key = keySelector(commonState, {
      value1: 1,
      value2: 2,
    }) as unknown;

    expect(key).toBe('1:2');
  });

  test('should return not composed key selector if result key sector has only one dependency', () => {
    const firstPropSelector = createPropSelector<{ value1: number }>().value1();
    const secondPropSelector = createPropSelector<{
      value2: number;
    }>().value2();

    const selector = createCachedSelector([], () => {})({
      keySelector: stringComposeKeySelectors(
        firstPropSelector,
        secondPropSelector,
      ),
    });

    const boundSelector = createBoundSelector(selector, {
      value1: 1,
    });

    if (!isCachedSelector(boundSelector)) {
      throw new Error('selector should be cached');
    }

    const { keySelector } = boundSelector;

    expect(isComposedKeySelector(keySelector)).toBeFalsy();
  });

  test('should return composed key selector if result key selector has more than one dependency', () => {
    const firstPropSelector = createPropSelector<{ value1: number }>().value1();
    const secondPropSelector = createPropSelector<{
      value2: number;
    }>().value2();
    const thirdPropSelector = createPropSelector<{ value3: number }>().value3();

    const selector = createCachedSelector([], () => {})({
      keySelector: stringComposeKeySelectors(
        firstPropSelector,
        secondPropSelector,
        thirdPropSelector,
      ),
    });

    const boundSelector = createBoundSelector(selector, {
      value1: 1,
    });

    if (!isCachedSelector(boundSelector)) {
      throw new Error('selector should be cached');
    }

    const { keySelector } = boundSelector;

    expect(isComposedKeySelector(keySelector)).toBeTruthy();
  });

  test('should bound exotic key selector without exclude', () => {
    const firstPropSelector = (state: State, props: { value1: number }) =>
      props.value1;
    const secondPropSelector = (state: State, props: { value2: number }) =>
      props.value2;
    const thirdPropSelector = (state: State, props: { value3: number }) =>
      props.value3;

    const selector = createCachedSelector(
      [firstPropSelector, secondPropSelector, thirdPropSelector],
      () => {},
    )({
      keySelector: stringComposeKeySelectors(
        firstPropSelector,
        secondPropSelector,
        thirdPropSelector,
      ),
    });

    const boundSelector = createBoundSelector(selector, {
      value1: 1,
      value3: 3,
    });

    if (!isCachedSelector(boundSelector)) {
      throw new Error('selector should be cached');
    }

    const { keySelector } = boundSelector;

    const key = keySelector(commonState, {
      value1: 10,
      value2: 20,
      value3: 30,
    }) as unknown;

    expect(key).toBe('1:20:3');
  });
});
