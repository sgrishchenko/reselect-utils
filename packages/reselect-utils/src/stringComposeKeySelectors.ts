import { createKeySelectorComposer } from './createKeySelectorComposer';

export const stringComposeKeySelectors = createKeySelectorComposer(
  (...keySelectors) => (state, props) => {
    let key: unknown = keySelectors[0](state, props);

    for (let i = 1; i < keySelectors.length; i += 1) {
      key += ':';
      key += keySelectors[i](state, props);
    }

    return key;
  },
);
