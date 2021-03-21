import ts from 'typescript';

const cachedSelectorCreators = [
  'createCachedSelector',
  'cachedStruct',
  'createCachedStructuredSelector',
  'cachedSeq',
  'createCachedSequenceSelector',
];

export const isCachedSelectorCreator = (callExpression: ts.CallExpression) => {
  const leftHandSideExpression = callExpression.expression;

  if (ts.isCallExpression(leftHandSideExpression)) {
    const expressionName = leftHandSideExpression.expression.getText();

    return cachedSelectorCreators.includes(expressionName);
  }

  return false;
};
