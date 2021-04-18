import {
  ASTUtils,
  TSESLint,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export const getCommaTokenFix = (
  fixer: TSESLint.RuleFixer,
  argument: TSESTree.ObjectExpression,
  sourceCode: TSESLint.SourceCode,
): TSESLint.RuleFix => {
  const emptyFix = fixer.insertTextBeforeRange([0, 0], ``);

  const lastProperty = argument.properties[argument.properties.length - 1];

  if (lastProperty === undefined) {
    return emptyFix;
  }

  const lastToken = sourceCode.getTokenAfter(lastProperty);

  if (lastToken && ASTUtils.isCommaToken(lastToken)) {
    return emptyFix;
  }

  return fixer.insertTextAfter(lastProperty, `,`);
};
