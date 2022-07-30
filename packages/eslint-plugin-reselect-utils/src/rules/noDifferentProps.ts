import {
  AST_NODE_TYPES,
  ESLintUtils,
} from '@typescript-eslint/experimental-utils';
import { ruleCreator } from '../utils/ruleCreator';
import { getCachedSelectorCreatorOptions } from '../utils/getCachedSelectorCreatorOptions';
import { getKeySelector } from '../utils/getKeySelector';
import { areParametersDifferent } from '../utils/areParametersDifferent';
import { getPropSelectorText } from '../utils/getPropSelectorText';
import { isCachedSelectorCreator } from '../utils/isCachedSelectorCreator';
import { getParametersFromProps } from '../utils/getParametersFromProps';
import { getImportFix } from '../utils/getImportFix';
import { getSelectorProps } from '../utils/getSelectorProps';
import { getCommaTokenFix } from '../utils/getCommaTokenFix';
import { getKeySelectorFix } from '../utils/getKeySelectorFix';

export type Options = {
  composer?: 'stringComposeKeySelectors' | 'arrayComposeKeySelectors' | string;
};

export enum Errors {
  DifferentProps = 'DifferentProps',
}

export const noDifferentPropsRule = ruleCreator({
  name: 'no-different-props',
  defaultOptions: [
    {
      composer: 'stringComposeKeySelectors',
    },
  ] as [Options],
  meta: {
    docs: {
      description: 'Cached selector and key selector must have same props.',
      recommended: 'error',
    },
    fixable: 'code',
    messages: {
      [Errors.DifferentProps]:
        'Cached selector and key selector must have same props. selector parameters = {{selectorParameters}}, key selector parameters = {{keySelectorParameters}}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          composer: {
            type: 'string',
          },
        },
      },
    ],
    type: 'problem',
  },
  create: (context, [options]) => {
    const { composer = 'stringComposeKeySelectors' } = options;
    const sourceCode = context.getSourceCode();
    const { esTreeNodeToTSNodeMap, program } = ESLintUtils.getParserServices(
      context,
    );
    const typeChecker = program.getTypeChecker();

    return {
      CallExpression(callExpression) {
        const tsNode = esTreeNodeToTSNodeMap.get(callExpression);

        if (isCachedSelectorCreator(tsNode)) {
          const cachedOptions = getCachedSelectorCreatorOptions(
            tsNode,
            typeChecker,
          );
          const keySelector = getKeySelector(cachedOptions);

          if (keySelector && keySelector.valueDeclaration) {
            const keySelectorType = typeChecker.getTypeOfSymbolAtLocation(
              keySelector,
              keySelector.valueDeclaration,
            );
            const cachedSelectorType = typeChecker.getTypeAtLocation(tsNode);

            const keySelectorProps = getSelectorProps(
              keySelectorType,
              typeChecker,
            );
            const cachedSelectorProps = getSelectorProps(
              cachedSelectorType,
              typeChecker,
            );

            const selectorParameters = getParametersFromProps(
              cachedSelectorProps,
              typeChecker,
            );
            const keySelectorParameters = getParametersFromProps(
              keySelectorProps,
              typeChecker,
            );

            if (
              areParametersDifferent(selectorParameters, keySelectorParameters)
            ) {
              const selectorParametersString = selectorParameters
                .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                .join(';');

              const keySelectorParametersString = keySelectorParameters
                .map((prop) => ` ${prop.name}: ${prop.typeString} `)
                .join(';');

              context.report({
                messageId: Errors.DifferentProps,
                node: callExpression.arguments[0],
                data: {
                  selectorParameters: `{${selectorParametersString}}`,
                  keySelectorParameters: `{${keySelectorParametersString}}`,
                },
                fix(fixer) {
                  const argument = callExpression.arguments[0];

                  const propSelectors = selectorParameters.map(
                    getPropSelectorText,
                  );
                  const isComposedSelector = propSelectors.length > 1;
                  const isDefaultKeySelector = propSelectors.length === 0;
                  const composedPropSelector = isComposedSelector
                    ? `${composer}(\n${propSelectors.join(', \n')}\n)`
                    : propSelectors[0] ?? 'defaultKeySelector';

                  if (argument.type === AST_NODE_TYPES.ObjectExpression) {
                    const commaTokenFix = getCommaTokenFix(
                      fixer,
                      argument,
                      sourceCode,
                    );

                    const keySelectorFix = getKeySelectorFix(
                      fixer,
                      argument,
                      sourceCode,
                      composedPropSelector,
                    );

                    const specifierNames = ['prop'];
                    if (isComposedSelector) {
                      specifierNames.push(composer);
                    }
                    if (isDefaultKeySelector) {
                      specifierNames.push('defaultKeySelector');
                    }

                    const importFix = getImportFix(
                      fixer,
                      callExpression,
                      'reselect-utils',
                      specifierNames,
                    );

                    return [commaTokenFix, keySelectorFix, importFix];
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
