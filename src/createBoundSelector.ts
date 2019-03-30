import { ParametricSelector, Selector } from './types';
import { OutputParametricCachedSelector } from 're-reselect';

export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

export default <S, P1, P2 extends Partial<P1>, R>(
  baseSelector:
    | ParametricSelector<S, P1, R>
    | ReturnType<OutputParametricCachedSelector<S, P1, R, any, any>>,
  binding: P2,
) => {
  const baseName =
    'selectorName' in baseSelector
      ? baseSelector.selectorName
      : baseSelector.name;

  const boundSelector = (state: S, props: any) =>
    baseSelector(state, {
      ...(props || {}),
      ...(binding || {}),
    });

  const bindingStructure = Object.keys(binding).reduce(
    (structure, key) => ({
      ...structure,
      [key]: '[*]',
    }),
    {},
  );
  const bindingName = generateMappingName(bindingStructure);

  boundSelector.selectorName = `${baseName} (${bindingName})`;
  boundSelector.dependencies = [baseSelector];

  if ('getMatchingSelector' in baseSelector) {
    const decoratedBaseSelector = Object.assign(
      (state: S, props: any) => baseSelector(state, props),
      baseSelector,
    );

    decoratedBaseSelector.getMatchingSelector = (state: S, props: any) =>
      baseSelector.getMatchingSelector(state, {
        ...(props || {}),
        ...(binding || {}),
      });

    decoratedBaseSelector.removeMatchingSelector = (state: S, props: any) =>
      baseSelector.removeMatchingSelector(state, {
        ...(props || {}),
        ...(binding || {}),
      });

    boundSelector.dependencies = [decoratedBaseSelector];
  }

  type BoundSelector = Exclude<keyof P1, keyof P2> extends never
    ? Selector<S, R>
    : ParametricSelector<S, Diff<P1, P2>, R>;

  return boundSelector as BoundSelector;
};
