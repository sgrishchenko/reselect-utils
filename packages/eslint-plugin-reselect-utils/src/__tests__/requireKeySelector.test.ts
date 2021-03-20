import { stripIndent } from 'common-tags';
import { createRuleTester } from '../utils/ruleTester';
import { Errors, requireKeySelectorRule } from '../rules/requireKeySelector';

const ruleTester = createRuleTester();

ruleTester.run('require-key-create-cached-selector', requireKeySelectorRule, {
  valid: [
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';
      
        const getDefaultOptions = () => ({
          keySelector: () => 1,
        });
      
        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
    },
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
          keySelector: () => 1,
        });
      `,
    },
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          keySelector: () => 1,
          ...getDefaultOptions(),
        });
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      output: stripIndent`
        import {defaultKeySelector} from 'reselect-utils';
        import createCachedSelector from 're-reselect';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';

        createCachedSelector(
          [],
          () => 1,
        )({});
      `,
      output: stripIndent`
        import {defaultKeySelector} from 'reselect-utils';
        import createCachedSelector from 're-reselect';

        createCachedSelector(
          [],
          () => 1,
        )({
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {prop, defaultKeySelector} from 'reselect-utils';
        
        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
    {
      code: stripIndent`
        import createCachedSelector from 're-reselect';
        import {defaultKeySelector} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        });
      `,
      output: stripIndent`
        import createCachedSelector from 're-reselect';
        import {defaultKeySelector} from 'reselect-utils';
        
        const getDefaultOptions = () => ({});

        createCachedSelector(
          [],
          () => 1,
        )({
          ...getDefaultOptions(),
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
  ],
});

ruleTester.run('require-key-cached-struct-selector', requireKeySelectorRule, {
  valid: [
    {
      code: stripIndent`
        import {cachedStruct} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: () => 1,
        });

        cachedStruct({})({
          ...getDefaultOptions(),
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedStruct} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedStruct({})({
          ...getDefaultOptions(),
          keySelector: () => 1,
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedStruct} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedStruct({})({
          keySelector: () => 1,
          ...getDefaultOptions(),
        });
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import {cachedStruct} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedStruct({})
        ({
          ...getDefaultOptions(),
        });
      `,
      output: stripIndent`
        import {cachedStruct, defaultKeySelector} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedStruct({})
        ({
          ...getDefaultOptions(),
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedStruct} from 'reselect-utils';

        cachedStruct({})({
        });
      `,
      output: stripIndent`
        import {cachedStruct, defaultKeySelector} from 'reselect-utils';

        cachedStruct({})({
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
  ],
});

ruleTester.run('require-key-cached-seq-selector', requireKeySelectorRule, {
  valid: [
    {
      code: stripIndent`
        import {cachedSeq} from 'reselect-utils';

        const getDefaultOptions = () => ({
          keySelector: () => 1,
        });

        cachedSeq([])({
          ...getDefaultOptions(),
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedSeq} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedSeq([])({
          ...getDefaultOptions(),
          keySelector: () => 1,
        });
      `,
    },
    {
      code: stripIndent`
        import {cachedSeq} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedSeq([])({
          keySelector: () => 1,
          ...getDefaultOptions(),
        });
      `,
    },
  ],
  invalid: [
    {
      code: stripIndent`
        import {cachedSeq} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedSeq([])({
        ...getDefaultOptions(),
        });
      `,
      output: stripIndent`
        import {cachedSeq, defaultKeySelector} from 'reselect-utils';

        const getDefaultOptions = () => ({});

        cachedSeq([])({
        ...getDefaultOptions(),
        
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
    {
      code: stripIndent`
        import {cachedSeq} from 'reselect-utils';

        cachedSeq([])({});
      `,
      output: stripIndent`
        import {cachedSeq, defaultKeySelector} from 'reselect-utils';

        cachedSeq([])({
        keySelector: defaultKeySelector
        });
      `,
      errors: [
        {
          messageId: Errors.KeySelectorIsMissing,
        },
      ],
    },
  ],
});
