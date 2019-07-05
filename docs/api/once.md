# once(selector)

## Description

The utility function that wraps the selector in a new selector that, when called, does not affect the number of references for [CounterObjectCache](/docs/api/CounterObjectCache.md). This is useful when the selector is called outside а React Component, for example, in in [Redux](https://redux.js.org/) middleware.

## Parameters

- _selector_ - base selector for decorating.

## Returns

New selector that does not affect the number of references for the [CounterObjectCache](/docs/api/CounterObjectCache.md).

## Examples

```js
import createCachedSelector from 're-reselect';
import { connect } from 'react-redux';
import { CounterObjectCache } from 'reselect-utils';

const personSelector = createCachedSelector(
  [state => state.persons, (state, props) => props.id],
  (persons, id) => persons[id],
)((state, props) => props.id, {
  cacheObject: new CounterObjectCache(),
});

personSelector(state, props); // will trigger a warning
// because the life cycle is not controlled.

once(personSelector)(state, props); // will not cause a warning
```
