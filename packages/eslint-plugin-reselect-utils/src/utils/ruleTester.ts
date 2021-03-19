import { join, resolve } from 'path';
import { TSESLint } from '@typescript-eslint/experimental-utils';

export const createRuleTester = () => {
  const tester = new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2020,
      project: join(__dirname, '../../tsconfig.eslint.json'),
      sourceType: 'module',
    },
  });
  const filename = resolve(__dirname, '../../file.ts');
  const run = tester.run.bind(tester);
  tester.run = (name, rule, { invalid = [], valid = [] }) =>
    run(name, rule, {
      invalid: invalid.map((test) => ({ ...test, filename })),
      valid: valid.map((test) =>
        typeof test === 'string'
          ? { code: test, filename }
          : { ...test, filename },
      ),
    });

  return tester;
};
