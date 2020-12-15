import { ParametricSelector } from 'reselect';
import { CachedSelector, NamedParametricSelector } from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defineDynamicSelectorName,
} from './helpers';

const generateMappingName = <P1, P2>(mapping: (props: P2) => P1) => {
  if (mapping.name) {
    return mapping.name;
  }

  const structure = mapping(
    new Proxy(
      {},
      {
        get: (target, key) => key,
      },
    ) as P2,
  );
  const structureKeys = Object.keys(structure).join();
  const structureValues = Object.values(structure).join();

  return `${structureKeys} -> ${structureValues}`;
};

const innerCreateAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
): NamedParametricSelector<S, P2, R> => (state: S, props: P2) =>
  baseSelector(state, mapping(props));

export const createAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
) => {
  const adaptedSelector = innerCreateAdaptedSelector(baseSelector, mapping);

  Object.assign(adaptedSelector, baseSelector);
  adaptedSelector.dependencies = [baseSelector];

  /* istanbul ignore else  */
  if (process.env.NODE_ENV !== 'production') {
    /* istanbul ignore else  */
    if (isDebugMode()) {
      defineDynamicSelectorName(adaptedSelector, () => {
        const baseName = getSelectorName(baseSelector);
        const mappingName = generateMappingName(mapping);

        return `${baseName} (${mappingName})`;
      });
    }
  }

  if (isCachedSelector(baseSelector)) {
    const cachedAdaptedSelector = (adaptedSelector as unknown) as CachedSelector;

    if (baseSelector.getMatchingSelector) {
      cachedAdaptedSelector.getMatchingSelector = innerCreateAdaptedSelector(
        baseSelector.getMatchingSelector,
        mapping,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      cachedAdaptedSelector.removeMatchingSelector = innerCreateAdaptedSelector(
        baseSelector.removeMatchingSelector,
        mapping,
      );
    }

    cachedAdaptedSelector.keySelector = innerCreateAdaptedSelector(
      baseSelector.keySelector,
      mapping,
    );
  }

  return adaptedSelector;
};
