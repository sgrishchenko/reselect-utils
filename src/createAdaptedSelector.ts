import { ParametricSelector } from './types';
import { OutputParametricCachedSelector } from 're-reselect';

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

const innerCreateAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
): ParametricSelector<S, P2, R> => {
  return (state: S, props: P2) => baseSelector(state, mapping(props));
};

export default <S, P1, P2, R>(
  baseSelector:
    | ParametricSelector<S, P1, R>
    | ReturnType<OutputParametricCachedSelector<S, P1, R, any, any>>,
  mapping: (props: P2) => P1,
) => {
  const baseName =
    'selectorName' in baseSelector
      ? baseSelector.selectorName
      : baseSelector.name;

  const adaptedSelector = innerCreateAdaptedSelector(baseSelector, mapping);

  const mappingResult = mapping(new Proxy(
    {},
    {
      get: (target, key) => key,
    },
  ) as any);

  const mappingName = mapping.name || generateMappingName(mappingResult);

  adaptedSelector.selectorName = `${baseName} (${mappingName})`;
  adaptedSelector.dependencies = [baseSelector];

  if ('getMatchingSelector' in baseSelector) {
    const decoratedBaseSelector: any = Object.assign(
      (state: S, props: P1) => baseSelector(state, props),
      baseSelector,
    );

    decoratedBaseSelector.getMatchingSelector = innerCreateAdaptedSelector(
      baseSelector.getMatchingSelector,
      mapping,
    );

    decoratedBaseSelector.removeMatchingSelector = innerCreateAdaptedSelector(
      baseSelector.removeMatchingSelector,
      mapping,
    );

    adaptedSelector.dependencies = [decoratedBaseSelector];
  }

  return adaptedSelector;
};
