import { ParametricSelector, Selector } from './types';

export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

export default <S, P1, P2 extends Partial<P1>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
) => {
  const baseName = baseSelector.selectorName || baseSelector.name;

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

  type BoundSelector = Exclude<keyof P1, keyof P2> extends never
    ? Selector<S, R>
    : ParametricSelector<S, Diff<P1, P2>, R>;

  return boundSelector as BoundSelector;
};
