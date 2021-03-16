import * as ts from 'typescript';

export const getCachedSelectorCreatorOptions = (
  callExpression: ts.CallExpression,
  typeChecker: ts.TypeChecker,
) => {
  const type = typeChecker.getTypeAtLocation(callExpression.arguments[0]);
  return typeChecker.getPropertiesOfType(type);
};
