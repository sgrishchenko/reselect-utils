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
const getPersonFullName = createSelector(
  (state, props) => state.persons[props.personId].firstName,
  (state, props) => state.persons[props.personId].secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

As you can see in the dependencies of this selector quite a lot of boilerplate code. The problem of duplicate code can be solved with `createPathSelector`:

```js
import { createPathSelector } from 'reselect-utils';

const getPerson = (state, props) => state.persons[props.personId];

const getPersonFullName = createSelector(
  createPathSelector(getPerson).firstName(),
  createPathSelector(getPerson).secondName(),
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

You can also add default values if you want the selector to produce an adequate result even in the absence of the necessary `person` in the `state`:

```js
import { createPathSelector } from 'reselect-utils';

const getPersonFullName = createSelector(
  createPathSelector(getPerson).firstName('John'),
  createPathSelector(getPerson).secondName('Doe'),
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

You can also work with objects of unlimited nesting:

```js
import { createPathSelector } from 'reselect-utils';

const getPersonInfo = createSelector(
  createPathSelector(getPerson).address.street('-'),
  createPathSelector(getPerson).some.very.deep.field(123),
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
const getPersonByMessageId = (state, props) => {
  const message = state.messages[props.messageId];

  return state.persons[message.personId];
};
```

This is an acceptable solution, but what if the chain is longer? `SelectorMonad` will help to solve such problems:

```js
import { SelectorMonad, createAdaptedSelector } from 'reselect-utils';

const getMessage = (state, props) => state.messages[props.messageId];
const getPerson = (state, props) => state.persons[props.personId];

const getPersonByMessageId = SelectorMonad.of(getMessage)
  .chain(message =>
    createAdaptedSelector(getPerson, { personId: message.personId }),
  )
  .buildSelector();
```

`SelectorMonad` allows you to create dynamic selectors that depend on the current state. Moreover, the callback that is passed to the `chain` method is cached by input parameters. `createAdaptedSelector` binds the selector to specific parameter values and turns a parametric selector into an non parametric. And at the end you must call the `buildSelector` method to get the normal selector. It’s like a chain of [Promises](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise). [SelectorMonad](/docs/quickstart.md#selector-monad) and [createAdaptedSelector](/docs/api/createAdaptedSelector.md) are described in detail in their [API](/docs/api.md).

## Counter Cache

[Re-reselect](https://github.com/toomuchdesign/re-reselect) library has a good approach to solving the problem of caching parametric selectors. But solving a caching problem you gain a memory management problem. [Re-reselect](https://github.com/toomuchdesign/re-reselect) offers several strategies for [limiting memory](https://github.com/toomuchdesign/re-reselect/tree/master/src/cache#readme), but they are all designed for a fixed cache size. How about trying to allocate and clear memory automatically? `CounterObjectCache` is trying to solve this problem. To use this strategy, you need to specify the `CounterObjectCache` instance as `createCachaedSelector` parameter:

```js
import createCachedSelector from 're-reselect';
import { CounterObjectCache } from 'reselect-utils';

const getSomething = createCachedSelector(
  state => state.value,
  (state, props) => props.prop,

  (value, prop) => ({ something: `${value} ${prop}` }),
)((state, props) => props.prop, {
  cacheObject: new CounterObjectCache(),
});
```

Now, the allocation of memory for the cache can be tied to the life cycle of the [React](https://reactjs.org/) component:

```js
import React from 'react';
import { connect } from 'react-redux';
import { reselectConnect } from 'reselect-utils';

const MyComponent = ({ something }) => <div>{something}</div>;

const ConnectedMyComponent = connect(getSomething)(
  reselectConnect(getSomething)(MyComponent),
);
```

Now the instance of `getSomething` selector will be created when `MyComponent` is mounted, updated when `MyComponent` properties are updated, and when the `MyComponent` is unmounted, the `getSomething` instance will be removed from cache. This is similar to how [selector factories](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances) work, but an instance of a selector for two identical components with the same parameters will be common (because [Re-reselect](https://github.com/toomuchdesign/re-reselect) is used).

But what if you want to use the selector not only in the component but also somewhere else, for example, in [Redux](https://redux.js.org/) middleware? Usually, the logic in the middleware does not have a lifetime and your selector will be constantly called with different properties. In this case, it is difficult to choose the optimal caching strategy. The easiest way is to simply abandon caching parameterized selectors in the middleware. In order to clear the memory in time when using the caching selector, you can use `once` (otherwise, the memory used will simply increase when you call the selector with different parameters):

```js
const { something } = once(getSomething)(state, props);
```

You can learn more about Counter Cache [here](/docs/api/CounterObjectCache.md).
