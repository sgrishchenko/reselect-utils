import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import * as ts from 'typescript';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelectorFromOptions';
import { getKeySelectorProps } from '../utils/getKeySelectorProps';
import { getSelectorCreatorReturnType } from '../utils/getSelectorCreatorReturnType';
import { getCachedSelectorProps } from '../utils/getCachedSelectorProps';
import { arePropsDifferent } from '../utils/arePropsDifferent';

export enum Errors {
  DifferentProps = 'DifferentProps',
}

export const noDifferentPropsRule = ruleCreator({
  name: 'no-different-props',
  defaultOptions: [],
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Cached selector and key selector must have same props',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      [Errors.DifferentProps]:
        'Cached selector and key selector must have same props',
    },
    schema: [],
    type: 'problem',
  },
  create: (context) => {
    const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(
      context,
    );
    const typeChecker = program.getTypeChecker();
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

            const selectorCreatorReturnType = getSelectorCreatorReturnType(
              expressionName === 'createCachedSelector'
                ? tsNode.expression
                : tsNode,
              typeChecker,
            );

            if (keySelector && selectorCreatorReturnType) {
              const keySelectorProps = getKeySelectorProps(
                keySelector,
                typeChecker,
              );

              const cachedSelectorProps = getCachedSelectorProps(
                selectorCreatorReturnType,
                typeChecker,
              );

              if (
                arePropsDifferent(
                  cachedSelectorProps,
                  keySelectorProps,
                  typeChecker,
                )
              ) {
                context.report({
                  messageId: Errors.DifferentProps,
                  node: callExpression.arguments[0],
                  fix(fixer) {
                    const propSelectors = cachedSelectorProps
                      .map((prop) => ({
                        name: prop.name,
                        type: typeChecker.typeToString(
                          typeChecker.getTypeOfSymbolAtLocation(
                            prop,
                            prop.valueDeclaration,
                          ),
                        ),
                      }))
                      .map(
                        (prop) =>
                          `prop<{ ${prop.name}: ${prop.type} }>().${prop.name}()`,
                      );

                    const isComposedSelector = propSelectors.length > 1;
                    const composedPropSelector = isComposedSelector
                      ? `composeKeySelectors(${propSelectors.join(', ')})`
                      : propSelectors[0];
                    const resultKeySelector = `keySelector: ${composedPropSelector}`;
                    const argument = callExpression.arguments[0];

                    if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                      const keySelectorNode = argument.properties.find(
                        (property) => {
                          if (
                            property.type === AST_NODE_TYPES.Property &&
                            property.key.type === AST_NODE_TYPES.Identifier
                          ) {
                            return property.key.name === 'keySelector';
                          }
                          return false;
                        },
                      );
                      const selectorFixer = keySelectorNode
                        ? fixer.replaceText(keySelectorNode, resultKeySelector)
                        : // keySelector is added via spread operator we cant modify that object so insert as last property
                          fixer.insertTextBeforeRange(
                            [argument.range[1] - 1, argument.range[1] - 1],
                            argument.properties.length === 0
                              ? `${resultKeySelector}`
                              : `, ${resultKeySelector}`,
                          );

                      if (reselectUtilsImportNode) {
                        const specifiersName = reselectUtilsImportNode.specifiers.map(
                          (specifier) => specifier.local.name,
                        );
                        const isPropMissing = specifiersName.every(
                          (name) => name !== 'prop',
                        );

                        if (isPropMissing) {
                          specifiersName.push('prop');
                        }

                        const isComposeMissing = specifiersName.every(
                          (name) => name !== 'composeKeySelectors',
                        );

                        if (isComposeMissing && isComposedSelector) {
                          specifiersName.push('composeKeySelectors');
                        }
                        const specifiers = specifiersName.join(', ');
                        return [
                          selectorFixer,
                          fixer.replaceText(
                            reselectUtilsImportNode,
                            `import {${specifiers}} from 'reselect-utils';`,
                          ),
                        ];
                      }

                      const resultImport = isComposedSelector
                        ? `import {prop, composeKeySelectors} from 'reselect-utils';`
                        : `import {prop} from 'reselect-utils';`;

                      return [
                        selectorFixer,
                        fixer.insertTextBeforeRange([0, 0], resultImport),
                      ];
                    }

                    return null;
                  },
                });
              }
            }
          }
        }
      },
    };
  },
});
