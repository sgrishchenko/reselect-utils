---
name: Chain & Empty Selectors
menu: Guides
route: '/guides/chain-and-empty-selectors'
---

# Chain & Empty Selectors

If you design your state like a data base, you should be familiar with _foreign keys_. Imagine that you have this normalized state:

```js
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

  messages: {
    100: {
      id: 100,
      personId: 1,
      text: 'Hello',
    },
    200: {
      id: 200,
      personId: 2,
      text: 'Buy',
    },
  },

  documents: {
    111: {
      id: 111,
      messageId: 100,
    },
    222: {
      id: 222,
      messageId: 200,
    },
  },
};
```

And you need get a person by `messageId`. You can use next code to solve this problem:

```typescript
const messagesSelector = (state: State) => state.messages;
const personsSelector = (state: State) => state.persons;

const messagePersonSelector = (state: State, props: { messageId: number }) => {
  const message = messagesSelector(state)[props.messageId];

  return messagesSelector(state)[message.personId];
};
```

It is working solution, but you can't use this selector as input for [Cached Selector](https://github.com/toomuchdesign/re-reselect#createcachedselector), because it fully uncached. Let's try to re-write this example via [re-reselect](https://github.com/toomuchdesign/re-reselect):

```typescript
import createCachedSelector from 're-reselect';
import { prop } from 'reselect-utils';

const messagePersonSelector = createCachedSelector(
  [(state: State) => state, prop<{ messageId: number }>().messageId()],
  (state, messageId) => {
    const message = messagesSelector(state)[messageId];

    return messagesSelector(state)[message.personId];
  },
)({
  keySelector: prop<{ messageId: number }>().messageId(),
});
```

Now our solution has become only worth. This selector is still fully uncached, because it depends on whole state. Additionally, written selector has an ugly combiner, which calls other selectors right in body. Reselect Utils propose next way:

```typescript
import createCachedSelector from 're-reselect';
import { prop, createChainSelector, createBoundSelector } from 'reselect-utils';

const personsSelector = (state: State) => state.persons;
const personSelector = createCachedSelector(
  [personsSelector, prop<{ personId: number }>().personId()],
  (persons, personId) => persons[personId],
)({
  keySelector: prop<{ personId: number }>().personId(),
});

const messagesSelector = (state: State) => state.messages;
const messageSelector = createCachedSelector(
  [messagesSelector, prop<{ messageId: number }>().messageId()],
  (messages, messageId) => messages[messageId],
)({
  keySelector: prop<{ messageId: number }>().messageId(),
});

const messagePersonSelector = createChainSelector(messageSelector)
  .chain(message =>
    createBoundSelector(personSelector, { personId: message.id }),
  )
  .build();
```

You can build longer chains. For example, if you want find person by `documentId` you can add next code:

```typescript
import { prop, chain, bound } from 'reselect-utils';

const documentsSelector = (state: State) => state.documents;
const documentSelector = createCachedSelector(
  [documentsSelector, prop<{ documentId: number }>().documentId()],
  (documents, documentId) => documents[documentId],
)({
  keySelector: prop<{ documentId: number }>().documentId(),
});

const documentPersonSelector = chain(documentSelector)
  .chain(document => bound(messageSelector, { messageId: document.id }))
  .chain(message => bound(personSelector, { personId: message.id }))
  .build();
```

Here we have used compact aliases `chain` and `bound` to reduce code. Now if we call `documentPersonSelector`, we can receive next results:

```typescript
documentPersonSelector(state, { documentId: 111 }); // => { firstName: 'Marry', ... }

documentPersonSelector(state, { documentId: 222 }); // => { firstName: 'Harry', ... }
```

`Chain Selector` uses monad pattern like the Promises. In chain callback you receive result of previous selector, and you should return a new derived selector. `Chain Selector` is flexible enough, you can make decisions and use conditions in chain callback:

```typescript
import createCachedSelector from 're-reselect';
import { prop, chain } from 'reselect-utils';

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

const shortNameSelector = createCachedSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName[0]}. ${secondName}`,
);

const nameSelector = chain(prop<{ isShort: boolean }>().isShort())
  .chain(isShort => (isShort ? shortNameSelector : fullNameSelector))
  .build();

nameSelector(state, { personId: 1, isShort: false }); // => 'Marry Poppins'
nameSelector(state, { personId: 1, isShort: true }); // => 'M. Poppins'
```

Here we change business logic implementation dynamically by `isShort` property. Another place where we can use conditional chaining is _optional foreign keys_. For example, we have next structure:

```typescript
type Parent = {
  parentId: number;
};

type Child = {
  childId: number;
  parentId?: number;
};

type State = {
  firstGeneration: Record<number, Parent>;
  secondGeneration: Record<number, Child>;
};

const exampleState: State = {
  firstGeneration: {
    1: { parentId: 1 },
    2: { parentId: 2 },
  },
  secondGeneration: {
    101: { childId: 101, parentId: 1 },
    102: { childId: 102 },
  },
};
```

As you can see, child with id `102` haven't a parent, so this relation is optional. We can write next selector for this case:

```typescript
import createCachedSelector from 're-reselect';
import { prop, chain, bound, empty } from 'reselect-utils';

const parentsSelector = (state: State) => state.firstGeneration;
const parentSelector = createCachedSelector(
  [parentsSelector, prop<{ parentId: number }>().parentId()],
  (parents, personId) => persons[personId],
)({
  keySelector: prop<{ parentId: number }>().parentId(),
});

const childrenSelector = (state: State) => state.secondGeneration;
const childSelector = createCachedSelector(
  [childrenSelector, prop<{ childId: number }>().childId()],
  (children, childId) => children[childId],
)({
  keySelector: prop<{ childId: number }>().childId(),
});

const parentByChildSelector = chain(childSelector)
  .chain(({ parentId }) => {
    return parentId !== undefined
      ? bound(parentSelector, {
          parentId,
        })
      : empty(parentSelector); // <- Pay attention here
  })
  .build();
```

We have used `Empty Selector` here. `Empty Selector` is a selector, which always returns `undefined`. You can just write `() => undefined` instead, but `empty` will help you to infer types correctly. Also you can use more verbose helper alias: `createEmptySelector`.

Another task, that can be solved via `Chain Selector`, is aggregation. For example, you have these selectors:

```typescript
import createCachedSelector from 're-reselect';
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

And you need find out the longest full name. You can use `Chain Selector` next way:

```typescript
import { chain, bound, seq } from 'reselect-utils';

const longestFullNameSelector = chain(personsSelector) // (1)
  .chain(persons =>
    seq(
      // (2)
      Object.values(persons).map(
        person => bound(fullNameSelector, { personId: person.id }), // (3)
      ),
    ),
  )
  .map((
    fullNames, // (4)
  ) =>
    fullNames.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
    ),
  )
  .build();
```

What happens here? At first, we select persons normalized structure in point `(1)`. Next we use `Sequence Selector` to create the aggregated selector from selector array in point `(2)`. Each selector in selector array is `Bound Selector`, see point `(3)`. Finally, we use `map` method in point `(4)` to transform array of full names to the longest full method. The `map` method is like the `chain` method, but you can return calculated value from it instead of derived selector.

Both of `map` and `chain` methods are cached. It means, that passed to them callback will not be called while result from a previous selector in a chain is the same.

Also, you can test logic in your `Chain Selectors`. Created `Chain Selector` exposes special static field `chainHierarchy`. You can use this field in your unit tests next way:

```typescript
const documentPersonSelector = chain(documentSelector)
  .chain(document => bound(messageSelector, { messageId: document.id }))
  .chain(message => bound(personSelector, { personId: message.id }))
  .build();

const samplePerson = { id: 1 };
const sampleMessage = { id: 100 };
const sampleDocument = { id: 111 };

const state = {
  persons: {
    1: samplePerson,
  },

  messages: {
    100: sampleMessage,
  },

  documents: {
    111: sampleDocument,
  },
};

const boundPersonSelector = documentPersonSelector.chainHierarchy(
  sampleMessage,
);
expect(boundPersonSelector(state)).toBe(samplePerson);

const boundMessageSelector = documentPersonSelector.chainHierarchy.parentChain(
  sampleDocument,
);
expect(boundMessageSelector(state)).toBe(sampleMessage);
```
