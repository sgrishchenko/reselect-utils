import { ParametricSelector } from 'reselect';
import { OutputParametricCachedSelector } from 're-reselect';
import { NamedParametricSelector } from './types';
import { getSelectorName, isDebugMode, isReReselectSelector } from './helpers';

const generateMappingName = (mapping: {}) =>
  `${Object.keys(mapping).join()} -> ${Object.values(mapping).join()}`;

const innerCreateAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
): NamedParametricSelector<S, P2, R> => {
  return (state: S, props: P2) => baseSelector(state, mapping(props));
};

export default <S, P1, P2, R>(
  baseSelector:
    | ParametricSelector<S, P1, R>
    | ReturnType<OutputParametricCachedSelector<S, P1, R, any, any>>,
  mapping: (props: P2) => P1,
) => {
  const adaptedSelector = innerCreateAdaptedSelector(baseSelector, mapping);

  adaptedSelector.dependencies = [baseSelector];

  if (process.env.NODE_ENV !== 'production') {
    if (isDebugMode()) {
      const baseName = getSelectorName(baseSelector);
      const mappingResult = mapping(new Proxy(
        {},
        {
          get: (target, key) => key,
        },
      ) as any);

      const mappingName = mapping.name || generateMappingName(mappingResult);

      adaptedSelector.selectorName = `${baseName} (${mappingName})`;
    }
  }

  if (isReReselectSelector(baseSelector)) {
    const decoratedBaseSelector = Object.assign(
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

    decoratedBaseSelector.keySelector = innerCreateAdaptedSelector(
      baseSelector.keySelector,
      mapping,
    );

    adaptedSelector.dependencies = [decoratedBaseSelector];
  }

  return adaptedSelector;
};
