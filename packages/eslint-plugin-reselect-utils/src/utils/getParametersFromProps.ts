import ts from 'typescript';
import { getTypeFromSymbol } from './getTypeFromSymbol';
import { unknownPropsType } from './getPropSelectorString';

export const getParametersFromProps = (
  props: ts.Symbol[],
  typeChecker: ts.TypeChecker,
) =>
  props.map((prop) => {
    const { type, isOptional } = getTypeFromSymbol(prop, typeChecker);
    const typeString = type ? typeChecker.typeToString(type) : unknownPropsType;

    return {
      name: prop.name,
      type,
      typeString,
      isOptional,
    };
  });
