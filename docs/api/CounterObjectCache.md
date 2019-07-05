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

## Constructor

#### Parameters

- _options_ - Configuration properties when instantiating a cache object. Properties:
  - _removeDelay_ - delay is before the instance of the selector is removed from the cache in milliseconds. Default value - 0.

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
