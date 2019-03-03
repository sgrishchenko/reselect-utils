import { ParametricSelector } from './types';

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

export default <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
) => {
  const baseName = baseSelector.selectorName || baseSelector.name;

  const adaptedSelector = (state: S, props: P2) =>
    baseSelector(state, mapping(props));

  const mappingResult = mapping(new Proxy(
    {},
    {
      get: (target, key) => key,
    },
  ) as any);

  const mappingName = mapping.name || generateMappingName(mappingResult);

  adaptedSelector.selectorName = `${baseName} (${mappingName})`;
  adaptedSelector.dependencies = [baseSelector];

  return adaptedSelector;
};
