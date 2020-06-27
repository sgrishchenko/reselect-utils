import createCachedSelector from 're-reselect';
import { createChainSelector } from '../createChainSelector';
import { createBoundSelector } from '../createBoundSelector';
import { createEmptySelector } from '../createEmptySelector';
import { isCachedSelector } from '../helpers';

describe('createEmptySelector', () => {
  type Parent = {
    parentId: number;
  };

  type Child = {
    childId: number;
    parentId?: number;
  };

  type State = {
    firstGeneration: Record<number, Parent>;
    secondGeneration: Record<number, Child>;
  };

  const exampleState: State = {
    firstGeneration: {
      1: { parentId: 1 },
      2: { parentId: 2 },
    },
    secondGeneration: {
      101: { childId: 101, parentId: 1 },
      102: { childId: 102 },
    },
  };

  const parentSelector = (state: State, props: { parentId: number }) => {
    return state.firstGeneration[props.parentId];
  };

  const childSelector = (state: State, props: { childId: number }) => {
    return state.secondGeneration[props.childId];
  };

  test('should return undefined for optional links', () => {
    const parentByChildSelector = createChainSelector(childSelector)
      .chain(({ parentId }) => {
        return parentId !== undefined
          ? createBoundSelector(parentSelector, {
              parentId,
            })
          : createEmptySelector(parentSelector);
      })
      .build();

    const result1 = parentByChildSelector(exampleState, {
      childId: 101,
    });

    expect(result1?.parentId).toBe(1);

    const result2 = parentByChildSelector(exampleState, {
      childId: 102,
    });

    expect(result2).toBeUndefined();
  });

  test('should create selector without parameters', () => {
    const emptyParentSelector = createEmptySelector(parentSelector);

    const result = emptyParentSelector(exampleState);

    expect(result).toBeUndefined();
  });

  describe('integration with re-reselect', () => {
    const parentCachedSelector = createCachedSelector(
      [
        (state: State) => state.firstGeneration,
        (_: State, props: { parentId: number }) => props.parentId,
      ],
      (firstGeneration, parentId) => {
        return firstGeneration[parentId];
      },
    )({
      keySelector: (_, props) => props.parentId,
    });

    test('should produce cached selector if input selector is cached', () => {
      const emptyParentCachedSelector = createEmptySelector(
        parentCachedSelector,
      );

      expect(isCachedSelector(emptyParentCachedSelector)).toBeTruthy();

      if (!isCachedSelector(emptyParentCachedSelector)) {
        throw new Error('emptyParentCachedSelector should be cached');
      }

      const key = emptyParentCachedSelector.keySelector(
        expect.anything(),
        expect.anything(),
      ) as unknown;

      expect(key).toBeDefined();
    });
  });
});
