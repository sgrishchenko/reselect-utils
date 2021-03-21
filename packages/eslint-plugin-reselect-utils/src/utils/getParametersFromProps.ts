import ts from 'typescript';
import { isPropOptional } from './isPropOptional';

export const unknownPropType = 'unknownPropType';

export type ParameterInfo = {
  name: string;
  typeString: string;
  isOptional: boolean;
};

export const getParametersFromProps = (
  props: ts.Symbol[],
  typeChecker: ts.TypeChecker,
): ParameterInfo[] =>
  props.map((prop) => {
    const { name } = prop;

    const [declaration] = prop.getDeclarations() ?? [];
    const propType = declaration
      ? typeChecker.getTypeAtLocation(declaration)
      : undefined;

    const typeString = propType
      ? typeChecker.typeToString(propType)
      : unknownPropType;

    const isOptional = isPropOptional(prop);

    return {
      name,
      typeString,
      isOptional,
    };
  });
