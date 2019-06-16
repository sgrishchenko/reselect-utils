# createPropSelector(selector)

## Description

Shortcut for `createPathSelector((state, props) => props)` (see [createPathSelector](/docs/api/createPathSelector.md)).

## Parameters

- _selector_ - base selector for getting properties.

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

const getPersons = state => state.persons;

const getPerson = createSelector(
  getPersons,
  createPropSelector().personId(),
  (persons, personId) => persons[personId],
);

getPerson(state, { personId: 1 }); // => 'Marry Poppins'
getPerson(state, { personId: 2 }); // => 'Harry Potter'
```

With TypeScript:

```typescript
type Props = {
  personId: number;
};

const getPerson = createSelector(
  getPersons,
  createPropSelector<Props>().personId(),
  (persons, personId) => persons[personId],
);
```
