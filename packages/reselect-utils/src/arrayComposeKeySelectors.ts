import { createKeySelectorComposer } from './createKeySelectorComposer';

export const arrayComposeKeySelectors = createKeySelectorComposer(
  (...keySelectors) => (state, props) => {
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
  },
);
