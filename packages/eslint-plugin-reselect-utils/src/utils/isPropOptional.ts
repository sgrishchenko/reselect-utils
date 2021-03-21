import ts from 'typescript';

export const isPropOptional = (prop: ts.Symbol) => {
  const [declaration] = prop.getDeclarations() ?? [];

  return (
    declaration &&
    ts.isPropertySignature(declaration) &&
    declaration.questionToken !== undefined
  );
};
