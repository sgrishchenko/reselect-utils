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

const personSelector = (state, props) => state.persons[props.personId];

const exactMarrySelector = createBoundSelector(personSelector, { personId: 1 });
const exactHarrySelector = createBoundSelector(personSelector, { personId: 2 });

exactMarrySelector(state); // => 'Marry Poppins'
exactHarrySelector(state); // => 'Harry Potter'
```

Partial binding:

```js
const sumSelector = (state, props) => props.x + props.y;

const plusOneSelector = createBoundSelector(sumSelector, { y: 1 });

plusOneSelector(null, { x: 2 }); // => 3
plusOneSelector(null, { x: 3 }); // => 4
```
