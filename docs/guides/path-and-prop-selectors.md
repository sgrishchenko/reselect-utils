---
name: Path & Prop Selectors
menu: Guides
route: '/guides/path-and-prop-selectors'
---

# Path & Prop Selectors

## Path Selectors

`Path Selector` helper is useful when you try to describe deep nested dependencies of your selector. Suppose you have such state:

```js
const state = {
  person: {
    id: 1,
    firstName: 'Marry',
    secondName: 'Poppins',
  },
};
```

Lets's write a simple selector for it:

```js
const personFullNameSelector = createSelector(
  state => state.person.firstName,
  state => state.person.secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

It is working example and now we don't need any helper to implement it. But what if our `person` object is optional. We can re-write our example next way:

```js
const personFullNameSelector = createSelector(
  state => state.person && state.person.firstName,
  state => state.person && state.person.secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

I can also use [optional chaining](https://github.com/tc39/proposal-optional-chaining) to reduce and simplify code:

```js
const personFullNameSelector = createSelector(
  state => state.person?.firstName,
  state => state.person?.secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
);
```

Yes, we still don't need any helper now. But what if we have normalized state with few optional persons:

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

In this case you need provide `personId` property in your selector. [Re-reselect](https://github.com/toomuchdesign/re-reselect) library is better for parametric selector, so now we can write something like this:

```js
import createCachedSelector from 're-reselect';

const personFullNameSelector = createCachedSelector(
  (state, props) => state.persons[props.personId]?.firstName,
  (state, props) => state.persons[props.personId]?.secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
)({
  keySelector: (state, props) => props.personId,
});
```

If you use [TypeScript](https://www.typescriptlang.org/) for static typing this example can look more complex:

```typescript
const personFullNameSelector = createCachedSelector(
  (state: State, props: Props) => state.persons[props.personId]?.firstName,
  (state: State, props: Props) => state.persons[props.personId]?.secondName,
  (firstName, secondName) => `${firstName} ${secondName}`,
)({
  keySelector: (state, props) => props.personId,
});
```

Now we can use `Path Selector` to reduce boilerplate code:

```typescript
import { createPathSelector } from 'reselect-utils';

const personsSelector = (state: State) => state.persons;

const personSelector = createCachedSelector(
  personsSelector,
  (state: State, props: Props) => props.personId,
  (persons, personId) => persons[personId],
)({
  keySelector: (state, props) => props.personId,
});

const personFullNameSelector = createCachedSelector(
  createPathSelector(personSelector).firstName(),
  createPathSelector(personSelector).secondName(),
  (firstName, secondName) => `${firstName} ${secondName}`,
)({
  keySelector: (state, props) => props.personId,
});
```

## Prop Selector

There is another `Prop Selector` helper for properties selection. `Prop Selector` is built on top `Path Selector`. Also, there are short aliases for `Prop Selector` and `Path Selector` helper. With these helpers you can re-write your code like this:

```typescript
import { path, prop } from 'reselect-utils';

const personsSelector = (state: State) => state.persons;

const personSelector = createCachedSelector(
  personsSelector,
  prop<Props>().personId(),
  (persons, personId) => persons[personId],
)({
  keySelector: prop<Props>().personId(),
});

const personFullNameSelector = createCachedSelector(
  path(personSelector).firstName(),
  path(personSelector).secondName(),
  (firstName, secondName) => `${firstName} ${secondName}`,
)({
  keySelector: prop<Props>().personId(),
});
```

You can set up default values in `Path Selector`, if you need:

```typescript
const personFullNameSelector = createCachedSelector(
  path(personSelector).firstName('John'), // <- Default value is used here
  path(personSelector).secondName('Doe'), // <- and here
  (firstName, secondName) => `${firstName} ${secondName}`,
)({
  keySelector: prop<Props>().personId(),
});
```

Now we have fully typed selector, that is cached by different properties.

You can also work with objects of unlimited nesting:

```typescript
import { path } from 'reselect-utils';

const personSelectorInfo = createSelector(
  path(personSelector).address.street('-'),
  path(personSelector).some.very.deep.field(123),
  (street, field) => ({ street, field }),
)({
  keySelector: prop<Props>().personProps.personId(),
});
```
