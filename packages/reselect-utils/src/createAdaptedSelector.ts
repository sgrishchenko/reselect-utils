import { ParametricSelector } from 'reselect';
import { NamedParametricSelector } from './types';
import {
  getSelectorName,
  isDebugMode,
  isCachedSelector,
  defineDynamicSelectorName,
} from './helpers';

const generateMappingName = (mapping: Function) => {
  if (mapping.name) {
    return mapping.name;
  }

  const structure = mapping(
    new Proxy(
      {},
      {
        get: (target, key) => key,
      },
    ),
  );
  const structureKeys = Object.keys(structure).join();
  const structureValues = Object.values(structure).join();

  return `${structureKeys} -> ${structureValues}`;
};

const innerCreateAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
): NamedParametricSelector<S, P2, R> => {
  return (state: S, props: P2) => baseSelector(state, mapping(props));
};

export const createAdaptedSelector = <S, P1, P2, R>(
  baseSelector: ParametricSelector<S, P1, R>,
  mapping: (props: P2) => P1,
) => {
  const adaptedSelector = innerCreateAdaptedSelector(baseSelector, mapping);

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
    const decoratedAdaptedSelector = Object.assign(
      adaptedSelector,
      baseSelector,
    );

    if (baseSelector.getMatchingSelector) {
      decoratedAdaptedSelector.getMatchingSelector = innerCreateAdaptedSelector(
        baseSelector.getMatchingSelector,
        mapping,
      );
    }

    if (baseSelector.removeMatchingSelector) {
      decoratedAdaptedSelector.removeMatchingSelector = innerCreateAdaptedSelector(
        baseSelector.removeMatchingSelector,
        mapping,
      );
    }

    decoratedAdaptedSelector.keySelector = innerCreateAdaptedSelector(
      baseSelector.keySelector,
      mapping,
    );

    return decoratedAdaptedSelector;
  }

  return adaptedSelector;
};
