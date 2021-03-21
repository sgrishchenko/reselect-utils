import ts from 'typescript';

export const getSelectorProps = (
  selectorType: ts.Type,
  typeChecker: ts.TypeChecker,
) => {
  const [signature] = typeChecker.getSignaturesOfType(
    selectorType,
    ts.SignatureKind.Call,
  );
  if (signature === undefined) {
    return [];
  }

  const [, props] = signature.parameters;
  if (props === undefined) {
    return [];
  }

  const propsType = typeChecker.getTypeOfSymbolAtLocation(
    props,
    props.valueDeclaration,
  );

  return typeChecker.getPropertiesOfType(propsType);
};
