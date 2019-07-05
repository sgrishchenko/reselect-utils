# reselectConnect(selector, options)(Component)

## Description

A utility function that creates a special [
Higher-Order Component](https://reactjs.org/docs/higher-order-components.html). This is HOC that decorates the `Component` in such a way that the instances of `selector` and his dependencies will be created when `Component` is mounted, replaced when `Component` properties are updated, and when the `Component` is unmounted, the `selector` instance will be removed from cache.

## Parameters

- _selector_ - selector for synchronization.
- _options_ (optional) - Component sync settings object:
  - _updateRefsOnStateChange_ - flag that includes updating the refs and redrawing the component for each change of state. By default it has value `false`. Can be set to `true` if your selector or its dependencies use a state in a [keySelector](https://github.com/toomuchdesign/re-reselect#keyselector). **BE CAREFUL**: the activation of this flag can reduce the performance of your application, usually using the state in the `keySelector` is a very exotic case, try to avoid it.
- _Component_ - Component for decorating.

## Returns

New decorated Component whose life cycle is synchronized with the [CounterObjectCache](/docs/api/CounterObjectCache.md) instances of selector and his dependencies.

## Examples

```jsx
import createCachedSelector from 're-reselect';
import { CounterObjectCache, reselectConnect } from 'reselect-utils';

const personSelector = createCachedSelector(
  [state => state.persons, (state, props) => props.id],
  (persons, id) => ({
    person: persons[id],
  }),
)((state, props) => props.id, {
  cacheObject: new CounterObjectCache(),
});

const MyComponent = ({ person }) => <div>{person.name}</div>;

const ConnectedMyComponent = connect(personSelector)(
  // here used second decoration
  reselectConnect(personSelector)(MyComponent),
);
```
