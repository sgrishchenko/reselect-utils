import {
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';

export const getKeySelectorProperty = (argument: TSESTree.ObjectExpression) =>
  argument.properties.find(
    (property) =>
      property.type === AST_NODE_TYPES.Property &&
      property.key.type === AST_NODE_TYPES.Identifier &&
      property.key.name === 'keySelector',
  );
