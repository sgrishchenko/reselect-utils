# createPropSelector()

## Description

Shortcut for `createPathSelector((state, props) => props)` (see [createPathSelector](/docs/api/createPathSelector.md)).

## Returns

The same as the [createPathSelector](/docs/api/createPathSelector.md) returns.

## Examples

```js
import { createPropSelector } from 'reselect-utils';
import { createSelector } from 'reselect';

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

const personsSelector = state => state.persons;

const personSelector = createSelector(
  personsSelector,
  createPropSelector().personId(),
  (persons, personId) => persons[personId],
);

personSelector(state, { personId: 1 }); // => 'Marry Poppins'
personSelector(state, { personId: 2 }); // => 'Harry Potter'
```

With TypeScript:

```typescript
type Props = {
  personId: number;
};

const personSelector = createSelector(
  personsSelector,
  createPropSelector<Props>().personId(),
  (persons, personId) => persons[personId],
);
```
