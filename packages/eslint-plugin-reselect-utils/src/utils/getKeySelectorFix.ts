import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export const getKeySelectorFix = (
  fixer: TSESLint.RuleFixer,
  argument: TSESTree.ObjectExpression,
  keySelectorValue: string,
): TSESLint.RuleFix => {
  const keySelectorProperty = argument.properties.find(
    (property) =>
      property.type === AST_NODE_TYPES.Property &&
      property.key.type === AST_NODE_TYPES.Identifier &&
      property.key.name === 'keySelector',
  );

  const keySelector = `keySelector: ${keySelectorValue}`;

  return keySelectorProperty
    ? fixer.replaceText(keySelectorProperty, keySelector)
    : fixer.insertTextBeforeRange(
        [argument.range[1] - 1, argument.range[1] - 1],
        `\n${keySelector}\n`,
      );
};
