import ts from 'typescript';

export const getCachedSelectorProps = (
  returnType: ts.Type,
  typeChecker: ts.TypeChecker,
) => {
  const returnName = returnType.aliasSymbol?.getName() ?? '';
  const propAliasTypeArgument = returnType.aliasTypeArguments?.[1];

  if (
    propAliasTypeArgument &&
    (returnName === 'OutputParametricCachedSelector' ||
      returnName === 'ParametricSelector')
  ) {
    return typeChecker.getPropertiesOfType(propAliasTypeArgument);
  }

  return [];
};
