import { ParameterInfo } from './getParametersFromProps';

export const getPropSelectorText = (selectorParameters: ParameterInfo) => {
  const { name, typeString, isOptional } = selectorParameters;

  return isOptional
    ? `prop<{ ${name}?: ${typeString} }>().${name}()`
    : `prop<{ ${name}: ${typeString} }>().${name}()`;
};
