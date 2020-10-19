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
} from './helpers';

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

export const createBoundSelector = <S, P2, P1 extends Partial<P2>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
  options: BoundSelectorOptions<S, P2, P1, R> = {},
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

    cachedBoundSelector.keySelector = bindingStrategy(
      baseSelector.keySelector,
      binding,
    );
  }

  return boundSelector;
};
