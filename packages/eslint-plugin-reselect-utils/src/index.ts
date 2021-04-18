import { noDifferentPropsRule } from './rules/noDifferentProps';
import { requireKeySelectorRule } from './rules/requireKeySelector';

export const configs = {
  recommended: {
    plugins: ['reselect-utils'],
    rules: {
      'reselect-utils/no-different-props': 'error',
      'reselect-utils/require-key-selector': 'error',
    },
  },
};

export const rules = {
  'no-different-props': noDifferentPropsRule,
  'require-key-selector': requireKeySelectorRule,
};
