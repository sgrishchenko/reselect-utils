import * as ts from 'typescript';
import { getTypeFromSymbol } from './getTypeFromSymbol';

export const getPropSelectorString = (
  symbol: ts.Symbol,
  typeChecker: ts.TypeChecker,
) => {
  const { type, isOptional } = getTypeFromSymbol(symbol, typeChecker);
  const typeString = type ? typeChecker.typeToString(type) : 'any';

  return isOptional
    ? `prop<{ ${symbol.name}?: ${typeString} }>().${symbol.name}()`
    : `prop<{ ${symbol.name}: ${typeString} }>().${symbol.name}()`;
};
