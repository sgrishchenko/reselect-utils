import { TSESTree } from '@typescript-eslint/experimental-utils';

export const getParent = <N extends TSESTree.Node>(
  node: TSESTree.Node,
  predicate: (node: TSESTree.Node) => node is N,
): N | undefined => {
  let result: TSESTree.Node | undefined = node;

  while (result && !predicate(result)) {
    result = result.parent;
  }

  return result;
};
