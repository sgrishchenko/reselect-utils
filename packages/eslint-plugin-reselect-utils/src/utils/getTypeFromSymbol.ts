import ts from 'typescript';

export const getTypeFromSymbol = (
  symbol: ts.Symbol,
  typeChecker: ts.TypeChecker,
) => {
  const [declaration] = symbol.getDeclarations() ?? [];

  if (declaration) {
    const type = typeChecker.getTypeAtLocation(declaration);

    return {
      type,
      isOptional:
        ts.isPropertySignature(declaration) &&
        declaration.questionToken !== undefined,
    };
  }

  return {
    type: undefined,
    isOptional: false,
  };
};
