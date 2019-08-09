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

You can also work with objects of unlimited nesting:

```js
import { createPathSelector } from 'reselect-utils';

const personSelectorInfo = createSelector(
  createPathSelector(personSelector).address.street('-'),
  createPathSelector(personSelector).some.very.deep.field(123),
  (street, field) => ({ street, field }),
);
```

A more detailed description can be found [here](/docs/api/createPathSelector.md).

## Selector Monad

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

This is an acceptable solution, but what if the chain is longer? `SelectorMonad` will help to solve such problems:

```js
import { SelectorMonad, createBoundSelector } from 'reselect-utils';

const messageSelector = (state, props) => state.messages[props.messageId];
const personSelector = (state, props) => state.persons[props.personId];

const personSelectorByMessageId = SelectorMonad.of(messageSelector)
  .chain(message =>
    createBoundSelector(personSelector, { personId: message.personId }),
  )
  .buildSelector();
```

`SelectorMonad` allows you to create dynamic selectors that depend on the current state. Moreover, the callback that is passed to the `chain` method is cached by input parameters. `createBoundSelector` binds the selector to specific parameter values and turns a parametric selector into an non parametric. And at the end you must call the `buildSelector` method to get the normal selector. It’s like a chain of [Promises](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). [SelectorMonad](/docs/quickstart.md#selector-monad) and [createBoundSelector](/docs/api/createBoundSelector.md) are described in detail in their [API](/docs/api.md).

## Counter Cache

[Re-reselect](https://github.com/toomuchdesign/re-reselect) library has a good approach to solving the problem of caching parametric selectors. But solving a caching problem you gain a memory management problem. [Re-reselect](https://github.com/toomuchdesign/re-reselect) offers several strategies for [limiting memory](https://github.com/toomuchdesign/re-reselect/tree/master/src/cache#readme), but they are all designed for a fixed cache size. How about trying to allocate and clear memory automatically? `CounterObjectCache` is trying to solve this problem. To use this strategy, you need to specify the `CounterObjectCache` instance as `createCachedSelector` parameter:
