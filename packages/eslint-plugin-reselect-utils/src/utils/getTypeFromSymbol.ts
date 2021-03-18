import * as ts from 'typescript';

export const getTypeFromSymbol = (
  symbol: ts.Symbol,
  typeChecker: ts.TypeChecker,
) => {
  if (symbol.valueDeclaration) {
    const type = typeChecker.getTypeOfSymbolAtLocation(
      symbol,
      symbol.valueDeclaration,
    );

    return {
      type,
      isOptional:
        ts.isPropertySignature(symbol.valueDeclaration) &&
        symbol.valueDeclaration.questionToken !== undefined,
    };
  }

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
