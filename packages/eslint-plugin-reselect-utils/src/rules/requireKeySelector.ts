import {
  ESLintUtils,
  AST_NODE_TYPES,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelectorFromOptions';

export enum Errors {
  KeySelectorIsMissing = 'keySelectorIsMissing',
}

export const requireKeySelectorRule = ruleCreator({
  name: 'require-key-selector',
  defaultOptions: [],
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Cached selector can`t work without key selector',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      [Errors.KeySelectorIsMissing]:
        'Cached selector can`t work without key selector',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(
      context,
    );
    const typeChecker = program.getTypeChecker();
    let isAdded = false;
    let reselectUtilsImportNode: TSESTree.ImportDeclaration | undefined;

    return {
      ImportDeclaration(importDeclaration) {
        if (importDeclaration.source.value === 'reselect-utils') {
          reselectUtilsImportNode = importDeclaration;
        }
      },
      CallExpression(callExpression) {
        const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

        if (ts.isCallExpression(tsNode.expression)) {
          const expressionName = tsNode.expression.expression.getText();

          if (
            expressionName === 'createCachedSelector' ||
            expressionName === 'cachedStruct' ||
            expressionName === 'cachedSeq'
          ) {
            const options = getCachedSelectorCreatorOptions(
              tsNode,
              typeChecker,
            );
            const keySelector = getKeySelector(options);

            if (keySelector === undefined) {
              context.report({
                messageId: Errors.KeySelectorIsMissing,
                node: callExpression.arguments[0],
                fix(fixer) {
                  const argument = callExpression.arguments[0];
                  const defaultKeySelector = `keySelector: defaultKeySelector`;

                  if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                    const selectorFixer = fixer.insertTextBeforeRange(
                      [argument.range[1] - 1, argument.range[1] - 1],
                      argument.properties.length === 0
                        ? defaultKeySelector
                        : `, ${defaultKeySelector}`,
                    );

                    if (isAdded) {
                      return selectorFixer;
                    }

                    isAdded = true;

                    if (reselectUtilsImportNode) {
                      const specifiersName = reselectUtilsImportNode.specifiers.map(
                        (specifier) => specifier.local.name,
                      );
                      const isDefaultKeyExist = specifiersName.some(
                        (name) => name === 'defaultKeySelector',
                      );

                      if (isDefaultKeyExist) {
                        return selectorFixer;
                      }

                      specifiersName.push('defaultKeySelector');

                      const specifiers = specifiersName.join(', ');
                      return [
                        selectorFixer,
                        fixer.replaceText(
                          reselectUtilsImportNode,
                          `import {${specifiers}} from 'reselect-utils';`,
                        ),
                      ];
                    }

                    return [
                      selectorFixer,
                      fixer.insertTextBeforeRange(
                        [0, 0],
                        `import {defaultKeySelector} from 'reselect-utils';`,
                      ),
                    ];
                  }
                  return null;
                },
              });
            }
          }
        }
      },
    };
  },
});
