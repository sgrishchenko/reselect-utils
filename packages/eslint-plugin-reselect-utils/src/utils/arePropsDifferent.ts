import * as ts from 'typescript';

export const arePropsDifferent = (
  selectorProperties: ts.Symbol[],
  keySelectorProperties: ts.Symbol[],
  typeChecker: ts.TypeChecker,
) => {
  if (selectorProperties.length !== keySelectorProperties.length) {
    return true;
  }

  return selectorProperties.some((selectorProperty) => {
    const propertyType = typeChecker.getTypeOfSymbolAtLocation(
      selectorProperty,
      selectorProperty.valueDeclaration,
    );

    return !keySelectorProperties.find((keySelectorProperty) => {
      const keySelectorPropertyType = typeChecker.getTypeOfSymbolAtLocation(
        keySelectorProperty,
        keySelectorProperty.valueDeclaration,
      );

      return (
        selectorProperty.name === keySelectorProperty.name &&
        typeChecker.typeToString(propertyType) ===
          typeChecker.typeToString(keySelectorPropertyType)
      );
    });
  });
};
