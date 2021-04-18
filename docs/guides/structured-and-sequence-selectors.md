---
name: Structured & Sequence Selectors
menu: Guides
route: '/guides/structured-and-sequence-selectors'
---

# Structured & Sequence Selectors

## Structured Selector

If you ever used [Reselect](https://github.com/reduxjs/reselect), you must be familiar with [Structured Selector](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector). Reselect Utils provides implementation of this helper but with improved typings. You can use `Structured Selector` from this library with heterogeneous selectors. Heterogeneous selectors are selectors with different types of state. See example:

```typescript
type PersonsStateSlice = {
  persons: Record<number, Person>;
};

const personsSelector = (state: PersonsStateSlice) => state.persons;

type MessagesStateSlice = {
  messages: Record<number, Message>;
};

const messagesSelector = (state: MessagesStateSlice) => state.messages;
```

Now we can write a selector what select data from both state slices:

```typescript
import { createStructuredSelector } from 'reselect-utils';

const personsAndMessagesSelector = createStructuredSelector({
  persons: personsSelector,
  messages: messagesSelector,
});
```

You can also use alias to reduce code:

```typescript
import { struct } from 'reselect-utils';

const personsAndMessagesSelector = struct({
  persons: personsSelector,
  messages: messagesSelector,
});
```

## Cached Structured Selector

If you use a parametric selector, you can use [Re-reselect](https://github.com/toomuchdesign/re-reselect). Reselect Utils provides `Cached Structured Selector` for these purposes. For example, we have next selectors:

```typescript
import { createCachedSelector } from 're-reselect';

const personSelector = createCachedSelector(
  personsSelector,
  (state: PersonsStateSlice, props: Props) => props.personId,
  (persons, personId) => persons[personId],
)({
  keySelector: (state, props) => props.personId,
});

const messageSelector = createCachedSelector(
  messagesSelector,
  (state: MessagesStateSlice, props: Props) => props.messageId,
  (messages, messageId) => messages[messageId],
)({
  keySelector: (state, props) => props.messageId,
});
```

You can write composing selector this way:

```typescript
import { cachedStruct } from 'reselect-utils';

const personAndMessageSelector = cachedStruct({
  persons: personSelector,
  messages: messageSelector,
})({ keySelector: (state, props) => `${props.personId}:${props.messageId}` });
```

`cachedStruct` is short alias for `Cached Structured Selector`.

## Sequence Selector

There is also another type of structure besides objects - arrays. Reselect Utils provides `Sequence Selector` helper for them:

```typescript
import { createCachedSelector } from 're-reselect';
import { bound, createSequenceSelector } from 'reselect-utils';

const personSelector = createCachedSelector(
  personsSelector,
  (state: PersonsStateSlice, props: Props) => props.personId,
  (persons, personId) => persons[personId],
)({
  keySelector: (state, props) => props.personId,
});

const firstPersonSelector = bound(personSelector, { personId: 1 });
const secondPersonSelector = bound(personSelector, { personId: 2 });

const firstTwoPersonsSelector = createSequenceSelector([
  firstPersonSelector,
  secondPersonSelector,
]);
```

`Bound Selector` is described [here](/guides/bound-and-adapted-selectors#bound-selector). Now if you have next state, you will receive next result:

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

firstTwoPersonsSelector(state); // => [{ firstName: 'Marry', ... }, { firstName: 'Harry', ... }]
```

## Cached Sequence Selector

If you try to combine parametric selectors, there is a cached version of `Sequence Selector`:

```typescript
import { createCachedSelector } from 're-reselect';
import { path, prop, bound, cachedSeq } from 'reselect-utils';

type Props = {
  personId: number;
  postfix: string;
};

const personFullNameSelector = createCachedSelector(
  path(personSelector).firstName(),
  path(personSelector).secondName(),
  prop<Props>().postfix(),
  (firstName, secondName, postfix) => `${firstName} ${secondName} (${postfix})`,
)({
  keySelector: (state, props) => `${props.personId}:${props.postfix}`,
});

const firstPersonFullNameSelector = bound(personFullNameSelector, {
  personId: 1,
});
const secondPersonFullNameSelector = bound(personFullNameSelector, {
  personId: 2,
});

const firstTwoPersonFullNamesSelector = cachedSeq([
  firstPersonFullNameSelector,
  secondPersonFullNameSelector,
])({
  keySelector: prop<Props>().postfix(),
});

firstTwoPersonsSelector(state, { postfix: '*' }); // => ['Marry Poppins (*)', 'Harry Potter (*)' }]

firstTwoPersonsSelector(state, { postfix: '?' }); // => ['Marry Poppins (?)', 'Harry Potter (?)' }]
```

`Path Selector` and `Prop Selector` are described [here](/guides/path-and-prop-selectors).
