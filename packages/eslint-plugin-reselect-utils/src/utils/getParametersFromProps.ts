import ts from 'typescript';
import { getTypeFromSymbol } from './getTypeFromSymbol';
import { unknownPropType } from './getPropSelectorString';

export const getParametersFromProps = (
  props: ts.Symbol[],
  typeChecker: ts.TypeChecker,
) =>
  props.map((prop) => {
    const { type, isOptional } = getTypeFromSymbol(prop, typeChecker);
    const typeString = type ? typeChecker.typeToString(type) : unknownPropType;

    return {
      name: prop.name,
      type,
      typeString,
      isOptional,
    };
  });
