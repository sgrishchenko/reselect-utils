---
name: Composing Key Selector Creator
menu: Guides
route: '/guides/composing-key-selector-creator'
---

# Composing Key Selector Creator

## Main Purpose

There is a concept of [Key Selector](https://github.com/toomuchdesign/re-reselect#keyselector) in [re-reselect](https://github.com/toomuchdesign/re-reselect). It is working approach, but there are some limitations in straight forward using of this solution. Look at this example:

```typescript
const state = {
  persons: {
    1: {
      id: 1,
      firstName: 'Marry',
      secondName: 'Poppins',
    },
    2: {
      id: 2,
      firstName: 'Harry',
      secondName: 'Potter',
    },
  },
};

import { createCachedSelector } from 're-reselect';
import { prop } from 'reselect-utils';

const personsSelector = (state: State) => state.persons;

const personSelector = createCachedSelector(
  [personsSelector, prop<{ personId: number }>().personId()],
  (persons, personId) => persons[personId],
)({
  keySelector: prop<{ personId: number }>().personId(),
});

const fullNameSelector = createCachedSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
)({
  keySelector: prop<{ personId: number }>().personId(),
});
```

As you can see, every time, when we want use `personSelector`, we should declare `keySelector`. Since [3.3.0 version](https://github.com/toomuchdesign/re-reselect/blob/master/CHANGELOG.md#330) [re-reselect](https://github.com/toomuchdesign/re-reselect) introduces special [Key Selector Creator](https://github.com/toomuchdesign/re-reselect#keyselectorcreator) option. This option can help you reduce `keySelector` boiler plate. Reselect Utils offer implementation of `Key Selector Creator`: `Composing Key Selector Creator`. This implementation just merges all `Key Selecters` from selector dependencies and splits them by `:` sign. So, previous example can be rewritten next way:

```typescript
import { prop, composingKeySelectorCreator } from 'reselect-utils';

const personSelector = createCachedSelector(
  [personsSelector, prop<{ personId: number }>().personId()],
  (persons, personId) => persons[personId],
)({
  keySelector: prop<{ personId: number }>().personId(),
});

const fullNameSelector = createCachedSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
)({
  keySelectorCreator: composingKeySelectorCreator,
});
```

But `Composing Key Selector Creator` don't detect props automatically, so every time, when you use some property in selector dependencies, you should declare it in `Key Selector`. See next example:

```typescript
import { prop, composingKeySelectorCreator } from 'reselect-utils';

const fullNameSelector = createCachedSelector(
  [personSelector, prop<{ prefix: string }>().prefix()],
  ({ firstName, secondName }, prefix) => `${prefix} ${firstName} ${secondName}`,
)({
  keySelector: prop<{ prefix: number }>().prefix(),
  keySelectorCreator: composingKeySelectorCreator,
});
```

Now `fullNameSelector` receives two properties: `personId` and `prefix`. It will work next way:

```typescript
fullNameSelector.keySelector(state, {
  personId: 1,
  prefix: 'Mr.',
}); // => 'Mr.:1'

fullNameSelector.keySelector(state, {
  personId: 2,
  prefix: 'Ms.',
}); // => 'Ms.:2'
```

## Key Selectors Composition

If you want use few props in selector dependencies, you can use `composeKeySelectors` helper:

```typescript
import {
  prop,
  composeKeySelectors,
  composingKeySelectorCreator,
} from 'reselect-utils';

const fullNameSelector = createCachedSelector(
  [
    personSelector,
    prop<{ prefix: string }>().prefix(),
    prop<{ postfix: string }>().postfix(),
  ],
  ({ firstName, secondName }, prefix, postfix) =>
    `${prefix} ${firstName} ${secondName} (${postfix})`,
)({
  keySelector: composeKeySelectors(
    prop<{ prefix: number }>().prefix(),
    prop<{ postfix: string }>().postfix(),
  ),
  keySelectorCreator: composingKeySelectorCreator,
});

fullNameSelector.keySelector(state, {
  personId: 1,
  prefix: 'Mr.',
  postfix: 'father',
}); // => 'Mr.:father:1'

fullNameSelector.keySelector(state, {
  personId: 2,
  prefix: 'Ms.',
  postfix: 'sister',
}); // => 'Ms.:sister:2'
```
