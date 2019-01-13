module.exports = {
  env: {
    jest: true,
  },
  extends: ['airbnb', 'prettier'],
  parser: 'typescript-eslint-parser',
  plugins: ['prettier'],
  rules: {
    'no-unused-vars': 'off', // imported types is unused
    'no-dupe-class-members': 'off', // overloads is dupe members
    'import/no-extraneous-dependencies': 'off', // imported types is extraneous
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
};
