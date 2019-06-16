# createPathSelector(selector)

## Description

The utility function allows you to easily write selectors that receive the properties of the result of the basic selector.

## Parameters

- _selector_ - base selector for getting properties.

## Returns

Chain structure for accessing nested properties at any depth. All properties in the chain are optional.
The property chain must **necessarily** complete a call expression in which you can specify a default value.
The result of the calling expression will be a new selector that will return the described property
or the default value if any property in the chain is missing.

## Examples

```js
import { createPathSelector } from 'reselect-utils';
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
      some: {
        deep: {
          optional: 'value',
        },
      },
    },
  },
};

const getPerson = (state, props) => state.persons[props.personId];

const getPersonInfo = createSelector(
  createPathSelector(getPerson).firstName(),
  createPathSelector(getPerson).secondName(),
  createPathSelector(getPerson).some.deep.optional('default'),
  (firstName, secondName, deepProp) =>
    `${firstName} ${secondName} (${deepProp})`,
);

getPersonInfo(state, { personId: 1 }); // => 'Marry Poppins (default)'
getPersonInfo(state, { personId: 2 }); // => 'Harry Potter (value)'
getPersonInfo(state, { personId: 3 }); // => 'undefined undefined (value)'
```
