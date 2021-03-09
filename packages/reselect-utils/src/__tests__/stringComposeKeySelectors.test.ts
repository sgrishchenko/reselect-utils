import { stringComposeKeySelectors } from '../stringComposeKeySelectors';
import { createPropSelector } from '../createPropSelector';
import { isComposedKeySelector } from '../composeKeySelectors';

describe('stringComposeKeySelectors', () => {
  const firstPropSelector = createPropSelector<{ value1: number }>().value1();
  const secondPropSelector = createPropSelector<{
    value2: number;
  }>().value2();
  const thirdPropSelector = createPropSelector<{ value3: number }>().value3();

  test('should return composed key selector', () => {
    const keySelector = stringComposeKeySelectors(
      firstPropSelector,
      secondPropSelector,
      thirdPropSelector,
    );

    expect(isComposedKeySelector(keySelector)).toBeTruthy();
  });

  test('should return string with results from input selectors', () => {
    const keySelector = stringComposeKeySelectors(
      firstPropSelector,
      secondPropSelector,
      thirdPropSelector,
    );

    const key: unknown = keySelector(expect.anything(), {
      value1: 1,
      value2: 2,
      value3: 3,
    });

    expect(key).toEqual('1:2:3');
  });

  test('should return flat string', () => {
    const keySelector = stringComposeKeySelectors(
      firstPropSelector,
      stringComposeKeySelectors(secondPropSelector, thirdPropSelector),
    );

    const key: unknown = keySelector(expect.anything(), {
      value1: 1,
      value2: 2,
      value3: 3,
    });

    expect(key).toEqual('1:2:3');
  });
});
