import { KeySelector, ParametricKeySelector } from 're-reselect';
import {
  composedKeySelectorSymbol,
  KeySelectorComposer,
} from './composeKeySelectors';

export const arrayComposeKeySelectors = (<S, P>(
  ...keySelectors: (KeySelector<S> | ParametricKeySelector<S, P>)[]
) => {
  const resultSelector = (state: S, props: P) => {
    let keyPath: unknown[] = [];

    for (let i = 0; i < keySelectors.length; i += 1) {
      const key: unknown = keySelectors[i](state, props);

      if (Array.isArray(key)) {
        keyPath = keyPath.concat(key);
      } else {
        keyPath.push(key);
      }
    }

    return keyPath;
  };

  resultSelector.dependencies = keySelectors;

  Object.defineProperty(resultSelector, composedKeySelectorSymbol, {
    value: true,
  });

  return resultSelector;
}) as KeySelectorComposer;
