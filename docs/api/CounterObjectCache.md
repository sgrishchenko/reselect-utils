# CounterObjectCache

## Description

[Re-reselect cache object](https://github.com/toomuchdesign/re-reselect/tree/master/src/cache) implementation with reference counter. When the selector instance has the number of references set to 0, the selector instance is automatically removed from the cache. This approach allows automatic cache memory management.

## Static Methods

### addRefRecursively(selector)(state, props)

#### Description

Recursively traverses the dependency chain of the selector and increments the number of references of each selector whose cache managed by CounterObjectCache.

#### Parameters

- _selector_ - base selector for recursive traverse.

- _state_ - state, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

- _props_ - props, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

#### Returns

Void.

### removeRefRecursively(selector)(state, props)

#### Description

Recursively traverses the dependency chain of the selector and decrements the number of references of each selector whose cache managed by CounterObjectCache.

#### Parameters

- _selector_ - base selector for recursive traverse.

- _state_ - state, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

- _props_ - props, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

#### Returns

Void.

### confirmValidAccessRecursively(selector)(state, props)

#### Description

Recursively traverses the dependency chain of the selector and confirms that access to the selector and its dependencies was valid.
This is useful when you want to make sure that the selector counters are properly managed.
Such utility functions as [reselectConnect](/docs/api/reselectConnect.md), [useSelector](/docs/api/useSelector.md) and [once](/docs/api/once.md) already include this confirmation. If you manage references manually, you should call this method every time immediately after calling the selector itself.

#### Parameters

- _selector_ - base selector for recursive traverse.

- _state_ - state, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

- _props_ - props, which will passed to [selector.keySelector](https://github.com/toomuchdesign/re-reselect#selectorkeyselector).

#### Returns

Void.

## Constructor

#### Parameters

- _options_ - Configuration properties when instantiating a cache object. Properties:
  - _removeDelay_ - delay is before the instance of the selector is removed from the cache in milliseconds. Default value - `0`.
  - _warnAboutUncontrolled_ - boolean flag that activates alerts for unconfirmed selector calls. Default value - `true`.

## Instance Methods

### set(key, selector)

#### Parameters

- _key_ - key to add a selector instance to the cache.
- _selector_ - selector instance.

#### Returns

Void.

### get(key)

#### Parameters

- _key_ - to get the selector instance.

#### Returns

Selector instance.

### remove(key)

#### Parameters

- _key_ - key to remove the selector instance.

#### Returns

Void.

### clear()

#### Description

Clears the entire cache.

#### Returns

Void.

### isValidCacheKey(key)

#### Parameters

- _key_ - cache key to validate.

#### Returns

If the key is valid, it returns the `true`, otherwise returns `false`.

### addRef(key)

#### Parameters

- _key_ - cache key whose number of references needs to be incremented.

#### Returns

Void.

### removeRef(key)

#### Parameters

- _key_ - cache key whose number of references needs to be decremented.

#### Returns

Void.

## Examples

### Usage with [Re-reselect](https://github.com/toomuchdesign/re-reselect)

```js
import createCachedSelector from 're-reselect';
import { CounterObjectCache } from 'reselect-utils';

const personSelector = (state, props) => state.persons[props.id];

const fullNameSelector = createCachedSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
)((state, props) => props.id, {
  cacheObject: new CounterObjectCache({
    removeDelay: 300,
  }),
});
```

### Manage the number of references.

```js
import { CounterObjectCache } from 'reselect-utils';

// selector call
const fullName = fullNameSelector(state, props);

// confirmation that the selector call was allowed
CounterObjectCache.confirmValidAccessRecursively(selector)(state, props);

// increase the number of references to the selector
// now the cache will store the selector instance created for this call.
CounterObjectCache.addRefRecursively(selector)(state, props);

// decrease the number of references to the selector
// if the number of references to the selector is zero,
// the selector instance will be removed from the cache.
CounterObjectCache.removeRefRecursively(selector)(state, props);
```
