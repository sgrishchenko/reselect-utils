import {
  AST_NODE_TYPES,
  TSESLint,
  TSESTree,
  ASTUtils,
} from '@typescript-eslint/experimental-utils';

export const getKeySelectorFix = (
  fixer: TSESLint.RuleFixer,
  argument: TSESTree.ObjectExpression,
  sourceCode: TSESLint.SourceCode,
  keySelectorValue: string,
): TSESLint.RuleFix => {
  const keySelectorProperty = argument.properties.find(
    (property) =>
      property.type === AST_NODE_TYPES.Property &&
      property.key.type === AST_NODE_TYPES.Identifier &&
      property.key.name === 'keySelector',
  );

  const keySelector = `keySelector: ${keySelectorValue}`;

  const firstToken = sourceCode.getFirstToken(argument);
  const lastToken = sourceCode.getLastToken(argument);
  const leadingLineBreak =
    firstToken &&
    lastToken &&
    ASTUtils.isTokenOnSameLine(firstToken, lastToken);

  return keySelectorProperty
    ? fixer.replaceText(keySelectorProperty, keySelector)
    : fixer.insertTextBeforeRange(
        [argument.range[1] - 1, argument.range[1] - 1],
        leadingLineBreak ? `\n${keySelector}\n` : `${keySelector}\n`,
      );
};
