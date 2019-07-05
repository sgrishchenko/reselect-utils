# useSelector(selector, props, options)

## Description

A custom [React hook](https://reactjs.org/docs/hooks-custom.html) that fetches the results of the `selector`, subscribes the Component to update this result, and synchronizes the number of references to the `selector` instances and the Component life cycle. The instances of `selector` and his dependencies will be created when Component is mounted, replaced when `props` are updated, and when the `Component` is unmounted, the `selector` instance will be removed from cache.

## Parameters

- _selector_ - selector for synchronization.
- _props_ - properties to be passed to the selector.
- _options_ (optional) - Component sync settings object:

  - _updateRefsOnStateChange_ - flag that includes updating the refs and redrawing the component for each change of state. By default it has value `false`. Can be set to `true` if your selector or its dependencies use a state in a [keySelector](https://github.com/toomuchdesign/re-reselect#keyselector). **BE CAREFUL**: the activation of this flag can reduce the performance of your application, usually using the state in the `keySelector` is a very exotic case, try to avoid it.

## Returns

The result of the selector call.

## Examples

```jsx
import createCachedSelector from 're-reselect';
import { CounterObjectCache, useSelector } from 'reselect-utils';

const personSelector = createCachedSelector(
  [state => state.persons, (state, props) => props.id],
  (persons, id) => persons[id],
)((state, props) => props.id, {
  cacheObject: new CounterObjectCache(),
});

const MyComponent = props => {
  const person = useSelector(personSelector, props);

  return <div>{person.name}</div>;
};
```
