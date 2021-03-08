import { ParametricSelector } from 'reselect';
import {
  CachedSelector,
  NamedParametricSelector,
  NamedSelector,
} from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defineDynamicSelectorName,
  defaultKeySelector,
  isObject,
  arePathsEqual,
  getObjectPaths,
} from './helpers';
import {
  composeKeySelectors,
  isComposedKeySelector,
} from './composeKeySelectors';
import { isPropSelector } from './createPropSelector';
import { excludeDefaultSelectors } from './composingKeySelectorCreator';

const generateBindingName = <P>(binding: P) => {
  const structure = Object.keys(binding).reduce(
    (result, key) => ({
      ...result,
      [key]: '[*]',
    }),
    {},
  );
  const structureKeys = Object.keys(structure).join();
  const structureValues = Object.values(structure).join();

  return `${structureKeys} -> ${structureValues}`;
};

/**
 * The special type to prevent binding of non optional props on optional values
 */
export type BoundSelector<S, P2, P1 extends Partial<P2>, R> = P2 extends Pick<
  P1,
  keyof P2
>
  ? Exclude<keyof P1, keyof P2> extends never
    ? NamedSelector<S, R>
    : NamedParametricSelector<S, Omit<P1, keyof P2>, R>
  : never;

export type BoundSelectorOptions<S, P2, P1 extends Partial<P2>, R> = {
  bindingStrategy?: (
    baseSelector: ParametricSelector<S, P1, R>,
    binding: P2,
  ) => ParametricSelector<S, Omit<P1, keyof P2>, R>;
};

const innerCreateBoundSelector = <S, P2, P1 extends Partial<P2>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
) => {
  const boundSelector = (state: S, props: Omit<P1, keyof P2> | void) =>
    baseSelector(state, ({
      ...props,
      ...binding,
    } as unknown) as P1);

  return boundSelector as BoundSelector<S, P2, P1, R>;
};

export const createBoundSelector = <
  S,
  P2,
  P1 extends Partial<P2>,
  R,
  OR extends R
>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
  options: BoundSelectorOptions<S, P2, P1, OR> = {},
): BoundSelector<S, P2, P1, R> => {
  const bindingStrategy =
    (options.bindingStrategy as typeof innerCreateBoundSelector) ??
    innerCreateBoundSelector;

  const boundSelector = bindingStrategy(baseSelector, binding);

  Object.assign(boundSelector, baseSelector);
  boundSelector.dependencies = [baseSelector];

  /* istanbul ignore else  */
  if (process.env.NODE_ENV !== 'production') {
    /* istanbul ignore else  */
    if (isDebugMode()) {
      defineDynamicSelectorName(boundSelector, () => {
        const baseName = getSelectorName(baseSelector);
        const bindingName = generateBindingName(binding);

        return `${baseName} (${bindingName})`;
      });
    }
  }

  if (isCachedSelector(baseSelector)) {
    const cachedBoundSelector = (boundSelector as unknown) as CachedSelector;

    if (baseSelector.getMatchingSelector) {
      cachedBoundSelector.getMatchingSelector = bindingStrategy(
        baseSelector.getMatchingSelector,
        binding,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      cachedBoundSelector.removeMatchingSelector = bindingStrategy(
        baseSelector.removeMatchingSelector,
        binding,
      );
    }

    const baseKeySelector = baseSelector.keySelector;

    if (isObject(binding)) {
      const paths = getObjectPaths(binding);
      let keySelectors = isComposedKeySelector(baseKeySelector)
        ? baseKeySelector.dependencies
        : [baseKeySelector];

      keySelectors = excludeDefaultSelectors(keySelectors);

      keySelectors = keySelectors.filter((keySelector) => {
        if (isPropSelector(keySelector)) {
          const { path: selectorPath } = keySelector;

          return paths.every((path) => !arePathsEqual(selectorPath, path));
        }

        return true;
      });

      if (keySelectors.length === 0) {
        cachedBoundSelector.keySelector = defaultKeySelector;
      } else if (keySelectors.length === 1) {
        const [keySelector] = keySelectors;
        cachedBoundSelector.keySelector = keySelector;
      } else {
        cachedBoundSelector.keySelector = composeKeySelectors(...keySelectors);
      }

      const isThereExoticKeySelectors = keySelectors.some(
        (keySelector) => !isPropSelector(keySelector),
      );

      if (isThereExoticKeySelectors) {
        cachedBoundSelector.keySelector = bindingStrategy(
          cachedBoundSelector.keySelector,
          binding,
        );
      }
    } else {
      cachedBoundSelector.keySelector = bindingStrategy(
        baseKeySelector,
        binding,
      );
    }
  }

  return boundSelector;
};
