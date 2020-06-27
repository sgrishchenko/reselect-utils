import createCachedSelector from 're-reselect';
import { createPropSelector } from '../createPropSelector';
import { composingKeySelectorCreator } from '../composingKeySelectorCreator';
import { createPathSelector } from '../createPathSelector';
import { createAdaptedSelector } from '../createAdaptedSelector';
import { createChainSelector } from '../createChainSelector';

describe('composingKeySelectorCreator', () => {
  const firstKeySelector = createPropSelector<{
    firstProp: string;
  }>().firstProp();

  const secondKeySelector = createPropSelector<{
    secondProp: string;
  }>().secondProp();

  const thirdKeySelector = createPropSelector<{
    thirdProp: string;
  }>().thirdProp();

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
    const keySelector = composingKeySelectorCreator({
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
    const keySelector = composingKeySelectorCreator({
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
    const keySelector = composingKeySelectorCreator({
      keySelector: thirdKeySelector,
      inputSelectors: [firstSelector, secondSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';
    const thirdProp = 'thirdProp';

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
      thirdProp,
    } as { thirdProp: string }) as unknown;

    expect(key).toBe(`${thirdProp}:${firstProp}:${secondProp}`);
  });

  test('should not duplicate selectors if they are equal', () => {
    const keySelector = composingKeySelectorCreator({
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

      const keySelector = composingKeySelectorCreator({
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

    const keySelector = composingKeySelectorCreator({
      keySelector: thirdKeySelector,
      inputSelectors: [inputSelector],
    });

    const firstProp = 'firstProp';
    const secondProp = 'secondProp';
    const thirdProp = 'thirdProp';

    const key = keySelector(expect.anything(), {
      firstProp,
      secondProp,
      thirdProp,
    } as { thirdProp: string }) as unknown;

    expect(key).toBe(`${thirdProp}:${firstProp}:${secondProp}`);
  });

  test('should can be used as real keySelectorCreator', () => {
    const cachedSelector = createCachedSelector(
      [firstSelector, secondSelector],
      () => undefined,
    )({
      keySelectorCreator: composingKeySelectorCreator,
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
});
