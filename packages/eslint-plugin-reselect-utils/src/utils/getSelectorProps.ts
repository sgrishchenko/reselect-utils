import ts from 'typescript';

export function getTypeArguments(
  type: ts.TypeReference,
  checker: ts.TypeChecker,
): readonly ts.Type[] {
  // getTypeArguments was only added in TS3.7
  if (checker.getTypeArguments) {
    return checker.getTypeArguments(type);
  }

  return type.typeArguments ?? [];
}

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

  const [, props] = signature.getParameters();
  if (props === undefined || props.valueDeclaration === undefined) {
    return [];
  }

  const nodeType = typeChecker.getTypeOfSymbolAtLocation(
    props,
    props.valueDeclaration,
  );

  const [params] = getTypeArguments(nodeType as ts.TypeReference, typeChecker);

  return typeChecker.getPropertiesOfType(params ?? nodeType);
};
