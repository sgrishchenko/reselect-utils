# createAdaptedSelector(selector, binding)

## Description

The utility function that adapts the selector to a different structure of the passed properties.

## Parameters

- _selector_ - base selector for adaptation.
- _mapping_ - function that accepts a new property structure and returns the structure that is required for the base selector.

## Returns

New selector with another property interface.

## Examples

```js
import {
  createAdaptedSelector,
  createStructuredSelector,
} from 'reselect-utils';

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
      text: 'Hello',
    },
    200: {
      id: 200,
      text: 'Buy',
    },
  },
};

const personSelector = (state, props) => state.persons[props.id];
const messageSelector = (state, props) => state.messages[props.id];

const personAndMessageSelector = createStructuredSelector({
  person: createAdaptedSelector(personSelector, ({ personId }) => ({
    id: personId,
  })),
  message: createAdaptedSelector(messageSelector, ({ messageId }) => ({
    id: messageId,
  })),
});

personAndMessageSelector(state, { personId: 1, messageId: 200 }); // => {person: 'Marry Poppins', message: 'Buy'}
```
