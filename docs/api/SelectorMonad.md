# SelectorMonad.of(selector)

## Description

Applying the monad pattern to selectors. Use cases:

- Using the results of one selector as properties for another selector.
- Aggregation of a set of entities by a calculated property.
- Dynamic switch selector when the input state changes.

For more information see [examples](#examples).

## Static Methods

### of(selector)

#### Parameters

- _selector_ - base selector for monadic chain.

#### Returns

New instance of Selector Monad.

## Instance Methods

### chain(result => selector)

#### Parameters

- _result => selector_ - function that returns a new selector based on the result of the previous one.
  The function is cached on the input result (even if the result is obtained
  from [Re-reselect](https://github.com/toomuchdesign/re-reselect) cached selector).

#### Returns

Selector Monad instance for chaining.

### map(mapper)

- _mapper_ - function that accepts the result of the previous selector and returns a new result.
  The shortcut for `.chain(result => () => result + 1)` will be `.map(result => result + 1)`.

#### Returns

Selector Monad instance for chaining.

### buildSelector()

#### Returns

Created selector that implements the whole chain.

## Examples

Common state and selectors for all examples:

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
    },
    200: {
      id: 200,
      personId: 2,
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

const personsSelector = state => state.persons;
const personSelector = (state, props) => state.persons[props.id];

const messagesSelector = state => state.messages;
const messageSelector = (state, props) => state.messages[props.id];

const documentsSelector = state => state.documents;
const documentSelector = (state, props) => state.documents[props.id];
```

### Entity Chain

```js
import { createSelector } from 'reselect';
import { SelectorMonad, createBoundSelector } from 'reselect-utils';

const fullNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const personByDocumentIdSelector = SelectorMonad.of(documentSelector)
  .chain(document =>
    createBoundSelector(messageSelector, { id: document.messageId }),
  )
  .chain(message =>
    createBoundSelector(fullNameSelector, { id: message.personId }),
  )
  .buildSelector();

personByDocumentIdSelector(state, { id: 111 }); // => 'Marry Poppins'
personByDocumentIdSelector(state, { id: 222 }); // => 'Harry Potter'
```

### Aggregation by a calculated property

```js
import { createSelector } from 'reselect';
import {
  SelectorMonad,
  createSequenceSelector,
  createBoundSelector,
} from 'reselect-utils';

const fullNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const longestFullNameSelector = SelectorMonad.of(personsSelector)
  .chain(persons =>
    createSequenceSelector(
      Object.values(persons).map(person =>
        createBoundSelector(fullNameSelector, { id: person.id }),
      ),
    ),
  )
  .map(fullNames =>
    fullNames.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
    ),
  )
  .buildSelector();

longestFullNameSelector(state); // => 'Marry Poppins'
```

### Dynamic switch selector

```js
import { createSelector } from 'reselect';
import { SelectorMonad, createPropSelector } from 'reselect-utils';

const fullNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const shortNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName[0]}. ${secondName}`,
);

const nameSelector = SelectorMonad.of(createPropSelector().isShort())
  .chain(isShort => (isShort ? shortNameSelector : fullNameSelector))
  .buildSelector();

nameSelector({ id: 1, isShort: false }); // => 'Marry Poppins'
nameSelector({ id: 1, isShort: true }); // => 'M. Poppins'
```
