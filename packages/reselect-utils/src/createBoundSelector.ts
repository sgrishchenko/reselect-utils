import { ParametricSelector } from 'reselect';
import { NamedParametricSelector, NamedSelector } from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defineDynamicSelectorName,
} from './helpers';

const generateBindingName = (binding: {}) => {
  const structure: {} = Object.keys(binding).reduce(
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

const innerCreateBoundSelector = <S, P1, P2 extends Partial<P1>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
) => {
  const boundSelector = (state: S, props: Omit<P1, keyof P2> | void) =>
    baseSelector(state, ({
      ...(props || {}),
      ...(binding || {}),
    } as unknown) as P1);

  type BoundSelector = Exclude<keyof P1, keyof P2> extends never
    ? NamedSelector<S, R>
    : NamedParametricSelector<S, Omit<P1, keyof P2>, R>;

  return boundSelector as BoundSelector;
};

export const createBoundSelector = <S, P1, P2 extends Partial<P1>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
) => {
  const boundSelector = innerCreateBoundSelector(baseSelector, binding);

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
    const decoratedBoundSelector = Object.assign(boundSelector, baseSelector);

    if (baseSelector.getMatchingSelector) {
      decoratedBoundSelector.getMatchingSelector = innerCreateBoundSelector(
        baseSelector.getMatchingSelector,
        binding,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      decoratedBoundSelector.removeMatchingSelector = innerCreateBoundSelector(
        baseSelector.removeMatchingSelector,
        binding,
      );
    }

    decoratedBoundSelector.keySelector = innerCreateBoundSelector(
      baseSelector.keySelector,
      binding,
    );

    return decoratedBoundSelector;
  }

  return boundSelector;
};
