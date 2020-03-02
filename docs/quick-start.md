---
name: Quick Start
route: '/quick-start'
---

# Quick Start

## Path Selector

Suppose you have such a normalized state:

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
};
```

And you want to build something like this selector:

```js
const personFullNameSelector = createSelector(
  (state, props) => state.persons[props.personId].firstName,
  (state, props) => state.persons[props.personId].secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

As you can see in the dependencies of this selector quite a lot of boilerplate code. The problem of duplicate code can be solved with `createPathSelector`:

```js
import { createPathSelector } from 'reselect-utils';

const personSelector = (state, props) => state.persons[props.personId];

const personFullNameSelector = createSelector(
  createPathSelector(personSelector).firstName(),
  createPathSelector(personSelector).secondName(),
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

You can also add default values if you want the selector to produce an adequate result even in the absence of the necessary `person` in the `state`:

```js
import { createPathSelector } from 'reselect-utils';

const personFullNameSelector = createSelector(
  createPathSelector(personSelector).firstName('John'),
  createPathSelector(personSelector).secondName('Doe'),
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

There are short aliases for many helpers in this library, so you can re-write your code like this:

```js
import { path } from 'reselect-utils';

const personFullNameSelector = createSelector(
  path(personSelector).firstName('John'),
  path(personSelector).secondName('Doe'),
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

You can also work with objects of unlimited nesting:

```js
import { path } from 'reselect-utils';

const personSelectorInfo = createSelector(
  path(personSelector).address.street('-'),
  path(personSelector).some.very.deep.field(123),
  (street, field) => ({ street, field }),
);
```

A more detailed description can be found [here](/reference/guides/path-and-prop-selectors).

## Chain Selector

Suppose you have such a normalized state:

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
};
```

And you want to select a person by the message id. You can write something like this:

```js
const personSelectorByMessageId = (state, props) => {
  const message = state.messages[props.messageId];

  return state.persons[message.personId];
};
```

This is an acceptable solution, but what if the chain is longer? `Chain Selector` will help to solve such problems:

```js
import { chain, bound } from 'reselect-utils';

const messageSelector = (state, props) => state.messages[props.messageId];
const personSelector = (state, props) => state.persons[props.personId];

const personByMessageIdSelector = chain(messageSelector)
  .chain(message => bound(personSelector, { personId: message.personId }))
  .build();
```

`Chain Selector` allows you to create dynamic selectors that depend on the current state. Moreover, the callback that is passed to the `chain` method is cached by input parameters. `bound` binds the selector to specific parameter values and turns a parametric selector into an non parametric. And at the end you must call the `build` method to get the normal selector. It’s like a chain of [Promises](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). [Chain Selector](/reference/guides/chain-selector) and [Bound Selector](/reference/guides/bound-and-adapted-selectors) are described in detail in Guides section.
