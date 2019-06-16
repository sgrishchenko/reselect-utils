module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  plugins: ['@typescript-eslint', '@typescript-eslint/tslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',

    '@typescript-eslint/prefer-interface': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',

    '@typescript-eslint/tslint/config': [
      'error',
      {
        lintFile: './tslint.json',
      },
    ],

    'no-dupe-class-members': 'off', // overloads is dupe members
    'react/prop-types': 'off', // typescript fully cover typing
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'jsx-a11y/label-has-for': 'off', // deprecated
    'jsx-a11y/label-has-associated-control': [
      'error',
      {
        assert: 'either',
        depth: 25,
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts', '.tsx'],
      },
    },
  },
};
