import { stripIndent } from 'common-tags';
import { createRuleTester } from '../../utils/ruleTester';
import { noDifferentPropsRule, Errors } from '../noDifferentProps';

const ruleTester = createRuleTester();

ruleTester.run(
  'no-different-props-create-cached-selector',
  noDifferentPropsRule,
  {
    valid: [
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: number }>().prop1(),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop, composeKeySelectors} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: composeKeySelectors(
            prop<{ prop1: number }>().prop1(),
            prop<{ prop2: string }>().prop2(),
          ),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
            (state: unknown, props: { prop2: string }) => props.prop2,
          ],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop, defaultKeySelector} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: defaultKeySelector,
        });

        createCachedSelector(
          [
            () => 1,
          ],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      },
    ],
    invalid: [
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({
          keySelector: prop<{ prop1: string }>().prop1(),
        });
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({...getDefaultOptions()});
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({...getDefaultOptions()});
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({
            keySelector: prop<{ prop2: number }>().prop2(),
         });
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
          ],
          () => 1,
        )({
            keySelector: prop<{ prop1: number }>().prop1(),
         });
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
            (state: unknown, props: { prop2: number }) => props.prop2,
          ],
          () => 1,
        )({
            keySelector: prop<{ prop2: number }>().prop2(),
         });
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop, composeKeySelectors} from 'reselect-utils';

        createCachedSelector(
          [
            (state: unknown, props: { prop1: number }) => props.prop1,
            (state: unknown, props: { prop2: number }) => props.prop2,
          ],
          () => 1,
        )({
            keySelector: composeKeySelectors(prop<{ prop1: number }>().prop1(), prop<{ prop2: number }>().prop2()),
         });
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
      {
        code: stripIndent`
        import createCachedSelector from 're-reselect';

        createCachedSelector(
          [],
          () => 1,
        )({
            keySelector: prop<{ prop2: number }>().prop2(),
         });
      `,
        output: stripIndent`
        import createCachedSelector from 're-reselect';

        createCachedSelector(
          [],
          () => 1,
        )({
            keySelector: defaultKeySelector,
         });
      `,
        errors: [
          {
            messageId: Errors.DifferentProps,
          },
        ],
      },
    ],
  },
);

ruleTester.run('no-different-props-cached-struct', noDifferentPropsRule, {
  valid: [
    {
      code: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: number }>().prop1(),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({
          ...getDefaultOptions(),
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedStruct, prop, composeKeySelectors} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: composeKeySelectors(
            prop<{ prop1: number }>().prop1(),
            prop<{ prop2: string }>().prop2(),
          ),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
          prop2: (state: unknown, props: { prop2: string }) => props.prop2,
        })({
          ...getDefaultOptions(),
        });
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({
          keySelector: prop<{ prop1: string }>().prop1(),
        });
      `,
      output: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({...getDefaultOptions()});
      `,
      output: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({...getDefaultOptions()});
      `,
      output: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({
          keySelector: prop<{ prop2: number }>().prop2(),
        });
      `,
      output: stripIndent`
        import {cachedStruct, prop} from 'reselect-utils';

        cachedStruct({
          prop1: (state: unknown, props: { prop1: number }) => props.prop1,
        })({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
  ],
});

ruleTester.run('no-different-props-cached-seq', noDifferentPropsRule, {
  valid: [
    {
      code: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({
          ...getDefaultOptions(),
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedSeq, prop, composeKeySelectors} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: composeKeySelectors(
            prop<{ prop1: number }>().prop1(),
            prop<{ prop2: number }>().prop2(),
          ),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number; prop2: number }) => props.prop1,
          (state: unknown, props: { prop1: number; prop2: number }) => props.prop2,
        ])({
          ...getDefaultOptions(),
        });
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({
          keySelector: prop<{ prop1: string }>().prop1(),
        });
      `,
      output: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({...getDefaultOptions()});
      `,
      output: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop1: string }>().prop1(),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({...getDefaultOptions()});
      `,
      output: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: prop<{ prop2: number }>().prop2(),
        });
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({...getDefaultOptions(), keySelector: prop<{ prop1: number }>().prop1()});
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({
          keySelector: prop<{ prop2: number }>().prop2(),
        });
      `,
      output: stripIndent`
        import {cachedSeq, prop} from 'reselect-utils';
      
        cachedSeq([
          (state: unknown, props: { prop1: number }) => props.prop1,
        ])({
          keySelector: prop<{ prop1: number }>().prop1(),
        });
      `,
      errors: [
        {
          messageId: Errors.DifferentProps,
        },
      ],
    },
  ],
});
