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

const getPersons = state => state.persons;
const getPerson = (state, props) => state.persons[props.id];

const getMessages = state => state.messages;
const getMessage = (state, props) => state.messages[props.id];

const getDocuments = state => state.documents;
const getDocument = (state, props) => state.documents[props.id];
```

### Entity Chain

```js
import { createSelector } from 'reselect';
import { SelectorMonad, createBoundSelector } from 'reselect-utils';

const getFullName = createSelector(
  [getPerson],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const getPersonByDocumentId = SelectorMonad.of(getDocument)
  .chain(document =>
    createBoundSelector(getMessage, { id: document.messageId }),
  )
  .chain(message => createBoundSelector(getFullName, { id: message.personId }))
  .buildSelector();

getPersonByDocumentId(state, { id: 111 }); // => 'Marry Poppins'
getPersonByDocumentId(state, { id: 222 }); // => 'Harry Potter'
```

### Aggregation by a calculated property

```js
import { createSelector } from 'reselect';
import {
  SelectorMonad,
  createSequenceSelector,
  createBoundSelector,
} from 'reselect-utils';

const getFullName = createSelector(
  [getPerson],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const getLongestFullName = SelectorMonad.of(getPersons)
  .chain(persons =>
    createSequenceSelector(
      Object.values(persons).map(person =>
        createBoundSelector(getFullName, { id: person.id }),
      ),
    ),
  )
  .map(fullNames =>
    fullNames.reduce((longest, current) =>
      current.length > longest.length ? current : longest,
    ),
  )
  .buildSelector();

getLongestFullName(state); // => 'Marry Poppins'
```

### Dynamic switch selector

```js
import { createSelector } from 'reselect';
import { SelectorMonad, createPropSelector } from 'reselect-utils';

const getFullName = createSelector(
  [getPerson],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

const getShortName = createSelector(
  [getPerson],
  ({ firstName, secondName }) => `${firstName[0]}. ${secondName}`,
);

const getName = SelectorMonad.of(createPropSelector().isShort())
  .chain(isShort => (isShort ? getShortName : getFullName))
  .buildSelector();

getName({ id: 1, isShort: false }); // => 'Marry Poppins'
getName({ id: 1, isShort: true }); // => 'M. Poppins'
```
