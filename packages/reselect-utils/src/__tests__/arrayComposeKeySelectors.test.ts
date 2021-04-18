import { arrayComposeKeySelectors } from '../arrayComposeKeySelectors';
import { createPropSelector } from '../createPropSelector';
import { isComposedKeySelector } from '../createKeySelectorComposer';

describe('arrayComposeKeySelectors', () => {
  const firstPropSelector = createPropSelector<{ value1: number }>().value1();
  const secondPropSelector = createPropSelector<{
    value2: number;
  }>().value2();
  const thirdPropSelector = createPropSelector<{ value3: number }>().value3();

  test('should return composed key selector', () => {
    const keySelector = arrayComposeKeySelectors(
      firstPropSelector,
      secondPropSelector,
      thirdPropSelector,
    );

    expect(isComposedKeySelector(keySelector)).toBeTruthy();
  });

  test('should return array of results from input selectors', () => {
    const keySelector = arrayComposeKeySelectors(
      firstPropSelector,
      secondPropSelector,
      thirdPropSelector,
    );

    const key: unknown = keySelector(expect.anything(), {
      value1: 1,
      value2: 2,
      value3: 3,
    });

    expect(key).toEqual([1, 2, 3]);
  });

  test('should return flat array', () => {
    const keySelector = arrayComposeKeySelectors(
      firstPropSelector,
      arrayComposeKeySelectors(secondPropSelector, thirdPropSelector),
    );

    const key: unknown = keySelector(expect.anything(), {
      value1: 1,
      value2: 2,
      value3: 3,
    });

    expect(key).toEqual([1, 2, 3]);
  });
});
