import ts from 'typescript';

const cachedSelectorCreators = [
  'createCachedSelector',
  'cachedStruct',
  'createCachedStructuredSelector',
  'cachedSeq',
  'createCachedSequenceSelector',
];

export const isCachedSelectorCreator = (
  expression: ts.Expression,
): expression is ts.CallExpression => {
  if (ts.isCallExpression(expression)) {
    const expressionName = expression.expression.getText();

    return cachedSelectorCreators.includes(expressionName);
  }

  return false;
};
