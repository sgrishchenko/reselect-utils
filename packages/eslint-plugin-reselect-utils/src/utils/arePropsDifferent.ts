import ts from 'typescript';
import { getTypeFromSymbol } from './getTypeFromSymbol';
import { unknownPropsType } from './getPropSelectorString';

export const arePropsDifferent = (
  selectorProperties: ts.Symbol[],
  keySelectorProperties: ts.Symbol[],
  typeChecker: ts.TypeChecker,
) => {
  if (selectorProperties.length !== keySelectorProperties.length) {
    return true;
  }

  return selectorProperties.some((selectorProperty) => {
    const {
      type: propertyType,
      isOptional: isPropertyOptional,
    } = getTypeFromSymbol(selectorProperty, typeChecker);
    const propertyTypeString = propertyType
      ? typeChecker.typeToString(propertyType)
      : unknownPropsType;

    return !keySelectorProperties.find((keySelectorProperty) => {
      const {
        type: keySelectorPropertyType,
        isOptional: isKeySelectorPropertyOptional,
      } = getTypeFromSymbol(keySelectorProperty, typeChecker);
      const keySelectorPropertyTypeString = keySelectorPropertyType
        ? typeChecker.typeToString(keySelectorPropertyType)
        : unknownPropsType;

      return (
        selectorProperty.name === keySelectorProperty.name &&
        propertyTypeString === keySelectorPropertyTypeString &&
        isPropertyOptional === isKeySelectorPropertyOptional
      );
    });
  });
};
