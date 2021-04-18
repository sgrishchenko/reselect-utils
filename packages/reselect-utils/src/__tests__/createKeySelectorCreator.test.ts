import { createCachedSelector } from 're-reselect';
import { createPropSelector } from '../createPropSelector';
import { createKeySelectorCreator } from '../createKeySelectorCreator';
import { createPathSelector } from '../createPathSelector';
import { createAdaptedSelector } from '../createAdaptedSelector';
import { createChainSelector } from '../createChainSelector';
import { stringComposeKeySelectors } from '../stringComposeKeySelectors';

describe('createKeySelectorCreator', () => {
  const keySelectorCreator = createKeySelectorCreator(
    stringComposeKeySelectors,
  );

  const firstKeySelector = createPropSelector<{
    firstProp: string;
  }>().firstProp();

  const secondKeySelector = createPropSelector<{
    secondProp: string;
  }>().secondProp();

  const thirdKeySelector = createPropSelector<{
    thirdProp: { value: string };
  }>().thirdProp.value();

  const firstSelector = createCachedSelector(
    firstKeySelector,
    () => undefined,
  )({
    keySelector: firstKeySelector,
  });

  const secondSelector = createCachedSelector(secondKeySelector, () => ({
    someValue: 'someValue',
  }))({
    keySelector: secondKeySelector,
  });

  test('should compose result selector key with delimiter', () => {
    const keySelector = keySelectorCreator({
      inputSelectors: [firstSelector, secondSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
    }) as unknown;

    expect(key).toBe(`${firstProp}:${secondProp}`);
  });

  test('should use own keySelector in composition', () => {
    const keySelector = keySelectorCreator({
      keySelector: firstKeySelector,
      inputSelectors: [secondSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
    } as { firstProp: string }) as unknown;

    expect(key).toBe(`${firstProp}:${secondProp}`);
  });

  test('should compose any number of selectors', () => {
    const keySelector = keySelectorCreator({
      keySelector: thirdKeySelector,
      inputSelectors: [firstSelector, secondSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';
    const thirdProp = { value: 'thirdProp' };

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
      thirdProp,
    } as { thirdProp: { value: string } }) as unknown;

    expect(key).toBe(`${thirdProp.value}:${firstProp}:${secondProp}`);
  });

  test('should not duplicate selectors if they are equal', () => {
    const keySelector = keySelectorCreator({
      keySelector: firstKeySelector,
      inputSelectors: [firstSelector, firstSelector, firstSelector],
    });

    const firstProp = 'firstProp';

    const key = keySelector(expect.anything(), {
      firstProp,
    }) as unknown;

    expect(key).toBe(firstProp);
    expect(keySelector).toBe(firstKeySelector);
  });

  test(
    'should be able extract keySelector from wrapped dependencies ' +
      '(adaptedSelector, boundSelector and pathSelector)',
    () => {
      const inputSelector = createPathSelector(
        createAdaptedSelector(
          secondSelector,
          (props: { altSecondProp: string }) => ({
            secondProp: `alt ${props.altSecondProp}`,
          }),
        ),
      ).someValue();

      const keySelector = keySelectorCreator({
        keySelector: firstKeySelector,
        inputSelectors: [inputSelector],
      });

      const firstProp = 'firstProp';
      const altSecondProp = 'secondProp';

      const key = keySelector(expect.anything(), {
        firstProp,
        altSecondProp,
      } as { firstProp: string }) as unknown;

      expect(key).toBe(`${firstProp}:alt ${altSecondProp}`);
    },
  );

  test('should be able extract keySelector from chainSelector', () => {
    const inputSelector = createChainSelector(firstSelector)
      .chain(() => secondSelector)
      .build();

    const keySelector = keySelectorCreator({
      keySelector: thirdKeySelector,
      inputSelectors: [inputSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';
    const thirdProp = { value: 'thirdProp' };

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
      thirdProp,
    } as { thirdProp: { value: string } }) as unknown;

    expect(key).toBe(`${thirdProp.value}:${firstProp}:${secondProp}`);
  });

  test('should can be used as real keySelectorCreator', () => {
    const cachedSelector = createCachedSelector(
      [firstSelector, secondSelector],
      () => undefined,
    )({
      keySelectorCreator,
    });

    const { keySelector } = cachedSelector;
    const firstProp = 'firstProp';
    const secondProp = 'secondProp';

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
    }) as unknown;

    expect(key).toBe(`${firstProp}:${secondProp}`);
  });

  test('should flat output key selector', () => {
    const inputKeySelector = createPropSelector<{
      prop: string;
    }>().prop();

    const keySelector = keySelectorCreator({
      keySelector: stringComposeKeySelectors(
        inputKeySelector,
        inputKeySelector,
      ),
      inputSelectors: [
        createCachedSelector(
          inputKeySelector,
          () => undefined,
        )({
          keySelector: stringComposeKeySelectors(
            inputKeySelector,
            inputKeySelector,
          ),
        }),
        createCachedSelector(
          inputKeySelector,
          () => undefined,
        )({
          keySelector: stringComposeKeySelectors(
            inputKeySelector,
            inputKeySelector,
          ),
        }),
      ],
    });

    const prop = 'prop';

    const key = keySelector(expect.anything(), {
      prop,
    }) as unknown;

    expect(key).toBe(`${prop}`);
  });

  test(
    'should flat output key selector ' +
      '(even if prop selectors are declared independently)',
    () => {
      const keySelector = keySelectorCreator({
        keySelector: stringComposeKeySelectors(
          createPropSelector<{ prop: string }>().prop(),
          createPropSelector<{ prop: string }>().prop(),
        ),
        inputSelectors: [
          createCachedSelector(
            createPropSelector<{ prop: string }>().prop(),
            () => undefined,
          )({
            keySelector: stringComposeKeySelectors(
              createPropSelector<{ prop: string }>().prop(),
              createPropSelector<{ prop: string }>().prop(),
            ),
          }),
          createCachedSelector(
            createPropSelector<{ prop: string }>().prop(),
            () => undefined,
          )({
            keySelector: stringComposeKeySelectors(
              createPropSelector<{ prop: string }>().prop(),
              createPropSelector<{ prop: string }>().prop(),
            ),
          }),
        ],
      });

      const prop = 'prop';

      const key = keySelector(expect.anything(), {
        prop,
      }) as unknown;

      expect(key).toBe(`${prop}`);
    },
  );
});
