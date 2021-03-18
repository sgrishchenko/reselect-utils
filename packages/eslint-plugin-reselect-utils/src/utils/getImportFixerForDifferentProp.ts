import { TSESLint, TSESTree } from '@typescript-eslint/experimental-utils';

export const getImportFixerForDifferentProp = (
  fixer: TSESLint.RuleFixer,
  importNode: TSESTree.ImportDeclaration | undefined,
  isComposedSelector: boolean,
  isDefaultKeySelector: boolean,
) => {
  const specifiersName = importNode
    ? importNode.specifiers.map((specifier) => specifier.local.name)
    : ['prop'];

  if (isDefaultKeySelector) {
    specifiersName.push('defaultKeySelector');
  }

  const isPropMissing = specifiersName.every((name) => name !== 'prop');
  if (isPropMissing) {
    specifiersName.push('prop');
  }

  const isComposeMissing = specifiersName.every(
    (name) => name !== 'composeKeySelectors',
  );
  if (isComposeMissing && isComposedSelector) {
    specifiersName.push('composeKeySelectors');
  }

  const specifiers = specifiersName.join(', ');
  const importText = `import {${specifiers}} from 'reselect-utils';`;

  return importNode
    ? fixer.replaceText(importNode, importText)
    : fixer.insertTextBeforeRange([0, 0], importText);
};
