import { KeySelector, ParametricKeySelector } from 're-reselect';
import {
  composedKeySelectorSymbol,
  KeySelectorComposer,
} from './composeKeySelectors';

export const stringComposeKeySelectors = (<S, P>(
  ...keySelectors: (KeySelector<S> | ParametricKeySelector<S, P>)[]
) => {
  const resultSelector = (state: S, props: P) => {
    let key: unknown = keySelectors[0](state, props);

    for (let i = 1; i < keySelectors.length; i += 1) {
      key += ':';
      key += keySelectors[i](state, props);
    }

    return key;
  };

  resultSelector.dependencies = keySelectors;

  Object.defineProperty(resultSelector, composedKeySelectorSymbol, {
    value: true,
  });

  return resultSelector;
}) as KeySelectorComposer;
