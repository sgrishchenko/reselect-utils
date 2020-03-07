import { ParametricSelector } from 'reselect';
import { OutputParametricCachedSelector } from 're-reselect';
import { NamedParametricSelector, NamedSelector } from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelectorSelector,
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
  baseSelector:
    | ParametricSelector<S, P1, R>
    | ReturnType<OutputParametricCachedSelector<S, P1, R, any, any>>,
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

  if (isCachedSelectorSelector(baseSelector)) {
    const decoratedBaseSelector = Object.assign(
      (state: S, props: P1) => baseSelector(state, props),
      baseSelector,
    );

    if (baseSelector.getMatchingSelector) {
      decoratedBaseSelector.getMatchingSelector = innerCreateBoundSelector(
        baseSelector.getMatchingSelector,
        binding,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      decoratedBaseSelector.removeMatchingSelector = innerCreateBoundSelector(
        baseSelector.removeMatchingSelector,
        binding,
      );
    }

    decoratedBaseSelector.keySelector = innerCreateBoundSelector(
      baseSelector.keySelector,
      binding,
    );

    boundSelector.dependencies = [decoratedBaseSelector];
  }

  return boundSelector;
};
