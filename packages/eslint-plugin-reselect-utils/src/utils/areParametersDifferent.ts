import { ParameterInfo } from './getParametersFromProps';

export const areParametersDifferent = (
  selectorParameters: ParameterInfo[],
  keySelectorParameters: ParameterInfo[],
) => {
  if (selectorParameters.length !== keySelectorParameters.length) {
    return true;
  }

  return selectorParameters.some(
    (selectorProperty) =>
      !keySelectorParameters.find(
        (keySelectorProperty) =>
          selectorProperty.name === keySelectorProperty.name &&
          selectorProperty.typeString === keySelectorProperty.typeString &&
          selectorProperty.isOptional === keySelectorProperty.isOptional,
      ),
  );
};
