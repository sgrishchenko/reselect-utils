import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/experimental-utils';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelectorFromOptions';
import { getKeySelectorProps } from '../utils/getKeySelectorProps';
import { getSelectorCreatorReturnType } from '../utils/getSelectorCreatorReturnType';
import { getCachedSelectorProps } from '../utils/getCachedSelectorProps';
import { arePropsDifferent } from '../utils/arePropsDifferent';
import { getPropSelectorString } from '../utils/getPropSelectorString';
import { getKeySelectorProperty } from '../utils/getKeySelectorProperty';
import { getImportFixerForDifferentProp } from '../utils/getImportFixerForDifferentProp';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';

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

        if (isCachedSelectorCreator(tsNode.expression)) {
          const expressionName = tsNode.expression.expression.getText();

          const options = getCachedSelectorCreatorOptions(tsNode, typeChecker);
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
                  const propSelectors = cachedSelectorProps.map((prop) =>
                    getPropSelectorString(prop, typeChecker),
                  );

                  const isComposedSelector = propSelectors.length > 1;
                  const isDefaultKeySelector = propSelectors.length === 0;
                  const composedPropSelector = isComposedSelector
                    ? `composeKeySelectors(\n${propSelectors.join(', \n')}\n)`
                    : propSelectors[0] ?? 'defaultKeySelector';
                  const resultKeySelector = `keySelector: ${composedPropSelector}`;
                  const argument = callExpression.arguments[0];

                  if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                    const keySelectorProperty = getKeySelectorProperty(
                      argument,
                    );
                    const selectorFixer = keySelectorProperty
                      ? fixer.replaceText(
                          keySelectorProperty,
                          resultKeySelector,
                        )
                      : // keySelector is added via spread operator we cant modify that object so insert as last property
                        fixer.insertTextBeforeRange(
                          [argument.range[1] - 1, argument.range[1] - 1],
                          argument.properties.length === 0
                            ? `${resultKeySelector}`
                            : `, ${resultKeySelector}`,
                        );
                    const importFixer = getImportFixerForDifferentProp(
                      fixer,
                      reselectUtilsImportNode,
                      isComposedSelector,
                      isDefaultKeySelector,
                    );

                    return [selectorFixer, importFixer];
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
