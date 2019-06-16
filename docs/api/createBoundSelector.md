# createBoundSelector(selector, binding)

## Description

The utility function that associates a basic parametric selector with specific properties.

## Parameters

- _selector_ - base selector for getting properties.
- _binding_ - full or partial declaration of the properties to be bound.

## Returns

New selector with bound properties.

## Examples

```js
import { createBoundSelector } from 'reselect-utils';

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

const getPerson = (state, props) => state.persons[props.personId];

const getMarry = createBoundSelector(getPerson, { personId: 1 });
const getHarry = createBoundSelector(getPerson, { personId: 2 });

getMarry(state); // => 'Marry Poppins'
getHarry(state); // => 'Harry Potter'
```

Partial binding:

```js
const getSum = (state, props) => props.x + props.y;

const getPlusOne = createBoundSelector(getSum, { y: 1 });

getPlusOne(null, { x: 2 }); // => 3
getPlusOne(null, { x: 3 }); // => 4
```
