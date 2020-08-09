import { KeySelector, ParametricKeySelector } from 're-reselect';
import { isPropSelector } from './createPropSelector';
import { isCachedSelector } from './helpers';
import {
  composeKeySelectors,
  isComposedKeySelector,
  OutputKeySelector,
  OutputParametricKeySelector,
} from './composeKeySelectors';

const areSelectorsEqual = (selector: unknown, another: unknown) => {
  if (selector === another) {
    return true;
  }

  if (isPropSelector(selector) && isPropSelector(another)) {
    const { path: selectorPath } = selector as { path: (string | number)[] };
    const { path: anotherPath } = another as { path: (string | number)[] };

    if (selectorPath.length !== anotherPath.length) {
      return false;
    }

    for (let i = 0; i < selectorPath.length; i += 1) {
      if (selectorPath[i] !== anotherPath[i]) {
        return false;
      }
    }

    return true;
  }

  return false;
};

const flatKeySelectors = <S, P>(
  keySelectors: (
    | KeySelector<S>
    | ParametricKeySelector<S, P>
    | OutputKeySelector<S, (KeySelector<S> | ParametricKeySelector<S, P>)[]>
    | OutputParametricKeySelector<
        S,
        P,
        (KeySelector<S> | ParametricKeySelector<S, P>)[]
      >
  )[],
) => {
  const result: (KeySelector<S> | ParametricKeySelector<S, P>)[] = [];

  for (let i = 0; i < keySelectors.length; i += 1) {
    const keySelector = keySelectors[i];

    if ('dependencies' in keySelector && isComposedKeySelector(keySelector)) {
      result.push(...flatKeySelectors(keySelector.dependencies));
    } else {
      result.push(keySelector);
    }
  }

  return result;
};

const uniqKeySelectors = <S, P>(
  keySelectors: (KeySelector<S> | ParametricKeySelector<S, P>)[],
) => {
  const result: (KeySelector<S> | ParametricKeySelector<S, P>)[] = [];

  for (let i = 0; i < keySelectors.length; i += 1) {
    const keySelector = keySelectors[i];

    const isKeySelectorAdded = result.some((resultKeySelector) =>
      areSelectorsEqual(keySelector, resultKeySelector),
    );
    if (!isKeySelectorAdded) {
      result.push(keySelector);
    }
  }

  return result;
};

export function composingKeySelectorCreator<S, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: KeySelector<S>;
}): KeySelector<S>;

export function composingKeySelectorCreator<S, P, D>(selectorInputs: {
  inputSelectors: D;
  keySelector?: ParametricKeySelector<S, P>;
}): ParametricKeySelector<S, P>;

export function composingKeySelectorCreator<S, P>({
  inputSelectors,
  keySelector,
}: {
  inputSelectors: (KeySelector<S> | ParametricKeySelector<S, P>)[];
  keySelector?: KeySelector<S> | ParametricKeySelector<S, P>;
}) {
  let keySelectors: (KeySelector<S> | ParametricKeySelector<S, P>)[] = [];

  if (keySelector) {
    keySelectors.push(keySelector);
  }

  inputSelectors.forEach((selector) => {
    if (isCachedSelector(selector)) {
      keySelectors.push(selector.keySelector);
    }
  });

  keySelectors = flatKeySelectors(keySelectors);
  keySelectors = uniqKeySelectors(keySelectors);

  if (keySelectors.length === 0) {
    return () => '<DefaultKey>';
  }

  if (keySelectors.length === 1) {
    const [resultSelector] = keySelectors;
    return resultSelector;
  }

  return composeKeySelectors(...keySelectors);
}
