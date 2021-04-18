import {
  TSESTree,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { getParent } from './getParent';

export const getImportDeclaration = (
  node: TSESTree.Node,
  sourceValue: string,
): TSESTree.ImportDeclaration | undefined => {
  const program = getParent(
    node,
    (current): current is TSESTree.Program =>
      current.type === AST_NODE_TYPES.Program,
  );

  if (program) {
    return program.body.find(
      (statement): statement is TSESTree.ImportDeclaration =>
        statement.type === AST_NODE_TYPES.ImportDeclaration &&
        statement.source.value === sourceValue,
    );
  }

  return undefined;
};
