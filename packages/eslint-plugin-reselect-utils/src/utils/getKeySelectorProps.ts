import ts from 'typescript';

export const getKeySelectorProps = (
  keySelector: ts.Symbol,
  typeChecker: ts.TypeChecker,
) => {
  const keySelectorType = typeChecker.getTypeOfSymbolAtLocation(
    keySelector,
    keySelector.valueDeclaration,
  );
  const propsType = keySelectorType.aliasTypeArguments?.[1];

  if (propsType) {
    return typeChecker.getPropertiesOfType(propsType);
  }
  return [];
};
