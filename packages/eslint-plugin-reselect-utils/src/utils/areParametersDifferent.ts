export const areParametersDifferent = (
  selectorParameters: {
    name: string;
    typeString: string;
    isOptional: boolean;
  }[],
  keySelectorParameters: {
    name: string;
    typeString: string;
    isOptional: boolean;
  }[],
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
