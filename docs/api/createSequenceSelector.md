# createSequenceSelector(selectors)

## Description

The utility function that takes an array of selectors and returns a selector that returns an array of results from input selectors.

## Parameters

- _selectors_ - array of input selectors.

## Returns

New selector that returns an array of results.

## Examples

```js
import { createSequenceSelector, createBoundSelector } from 'reselect-utils';

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

const getPerson = (state, props) => state.persons[props.id];

const getMarry = createBoundSelector(getPerson, { personId: 1 });
const getHarry = createBoundSelector(getPerson, { personId: 2 });

const getMarryAndHarry = createSequenceSelector([getMarry, getHarry]);

getMarryAndHarry(state); // => ['Marry Poppins', 'Harry Potter']
```
