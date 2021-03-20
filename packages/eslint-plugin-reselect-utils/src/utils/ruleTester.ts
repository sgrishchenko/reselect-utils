import { resolve } from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';

export const createRuleTester = () => {
  const parser = require.resolve('@typescript-eslint/parser');
  const project = resolve(__dirname, '../../tsconfig.eslint.json');
  const filename = resolve(__dirname, '../../file.ts');

  const tester = new TSESLint.RuleTester({
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      project,
      sourceType: 'module',
    },
  });

  const run = tester.run.bind(tester);
  tester.run = (name, rule, tests) => {
    const { invalid = [], valid = [] } = tests;

    run(name, rule, {
      invalid: invalid.map((test) => ({ ...test, filename })),
      valid: valid.map((test) =>
        typeof test === 'string'
          ? { code: test, filename }
          : { ...test, filename },
      ),
    });
  };

  return tester;
};
