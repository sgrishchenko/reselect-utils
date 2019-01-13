import { ParametricSelector, Selector } from './types';

export type Diff<T, U> = Pick<T, Exclude<keyof T, keyof U>>;

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

function createAdaptedSelector<S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
): ParametricSelector<S, P2, R>;

function createAdaptedSelector<S, P1, P2 extends Partial<P1>, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  binding: P2,
): Exclude<keyof P1, keyof P2> extends never
  ? Selector<S, R>
  : ParametricSelector<S, Diff<P1, P2>, R>;

function createAdaptedSelector(baseSelector: any, mappingOrBinding: any) {
  const baseName = baseSelector.selectorName || baseSelector.name;

  if (typeof mappingOrBinding === 'function') {
    const mapping = mappingOrBinding;

    const mappedSelector: any = (state: any, props: any) =>
      baseSelector(state, mapping(props));

    const mappingResult = mapping(
      new Proxy(
        {},
        {
          get: (target, key) => key,
        },
      ),
    );

    const mappingName = mapping.name || generateMappingName(mappingResult);

    mappedSelector.selectorName = `${baseName} (${mappingName})`;
    mappedSelector.dependencies = [baseSelector];

    return mappedSelector;
  }

  const binding = mappingOrBinding;

  const boundSelector: any = (state: any, props: any) =>
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

  return boundSelector;
}

export default createAdaptedSelector;
