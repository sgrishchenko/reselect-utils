import ts from 'typescript';

export const getSelectorCreatorReturnType = (
  selectorCreator: ts.CallExpression,
  typeChecker: ts.TypeChecker,
) => {
  const signature = typeChecker.getResolvedSignature(selectorCreator);
  if (signature) {
    return typeChecker.getReturnTypeOfSignature(signature);
  }
  return undefined;
};
