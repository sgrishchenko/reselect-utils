import ts from 'typescript';

export const getKeySelector = (properties: ts.Symbol[]) =>
  properties.find((property) => property.name === 'keySelector');
