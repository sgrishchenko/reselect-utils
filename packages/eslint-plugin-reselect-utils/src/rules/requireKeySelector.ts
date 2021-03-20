import {
  ESLintUtils,
  AST_NODE_TYPES,
} from '@typescript-eslint/experimental-utils';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelectorFromOptions';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';
import { getImportFix } from '../utils/getImportFix';

export enum Errors {
  KeySelectorIsMissing = 'keySelectorIsMissing',
}

export const requireKeySelectorRule = ruleCreator({
  name: 'require-key-selector',
  defaultOptions: [],
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Cached selector can`t work without key selector.',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      [Errors.KeySelectorIsMissing]:
        'Cached selector can`t work without key selector.',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(
      context,
    );
    const typeChecker = program.getTypeChecker();

    return {
      CallExpression(callExpression) {
        const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

        if (isCachedSelectorCreator(tsNode.expression)) {
          const options = getCachedSelectorCreatorOptions(tsNode, typeChecker);
          const keySelector = getKeySelector(options);

          if (keySelector === undefined) {
            context.report({
              messageId: Errors.KeySelectorIsMissing,
              node: callExpression.arguments[0],
              fix(fixer) {
                const argument = callExpression.arguments[0];
                const defaultKeySelector = `keySelector: defaultKeySelector`;

                if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                  const selectorFix = fixer.insertTextBeforeRange(
                    [argument.range[1] - 1, argument.range[1] - 1],
                    `\n${defaultKeySelector}\n`,
                  );

                  const importFix = getImportFix(
                    fixer,
                    callExpression,
                    'reselect-utils',
                    ['defaultKeySelector'],
                  );

                  return [selectorFix, importFix];
                }
                return null;
              },
            });
          }
        }
      },
    };
  },
});
