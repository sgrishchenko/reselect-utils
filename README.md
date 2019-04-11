# Reselect-Utils

[![npm version](https://img.shields.io/npm/v/reselect-utils.svg?style=flat-square)](https://www.npmjs.com/package/reselect-utils)
[![build status](https://img.shields.io/travis/com/sgrishchenko/reselect-utils/master.svg?style=flat-square)](https://travis-ci.com/sgrishchenko/reselect-utils)

## Install

Install from the NPM repository using yarn or npm:

```shell
yarn add reselect-utils
```

```shell
npm install reselect-utils
```

## Motivation

Such projects as [Reselect](https://github.com/reduxjs/reselect) and [Re-reselect](https://github.com/toomuchdesign/re-reselect) try to solve the task of memoization. But for some applied problems there is no standard solution published. This library was created to try to systematically solve the following problems:

- Work with optional objects as a source for selection.
- Binding parametric selectors to specific property values.
- Adaptation of parametric selectors to the new parameter interface (useful when creating parametric [structured selectors](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector)).
- Using selection results as parameters for a new selection.
- Calculating the aggregate value from a collection of selector results.
- Dynamic memory management strategy when using [cached selectors](https://github.com/toomuchdesign/re-reselect#api).

## Documentation

- [Introduction](/docs/introduction.md)
  - [Build Files](/docs/introduction.md#build-files)
- [Quick Start](/docs/quickstart.md)
  - [Path Selector](/docs/quickstart.md#path-selector)
  - [Selector Monad](/docs/quickstart.md#selector-monad)
  - [Counter Cache](/docs/quickstart.md#counter-cache)
- [API](/docs/api.md)
  - [createPathSelector](/docs/api.md#createPathSelector)
  - [createPropSelector](/docs/api.md#createPropSelector)
  - [createAdaptedSelector](/docs/api.md#createAdaptedSelector)
  - [SelectorMonad](/docs/api.md#SelectorMonad)
  - [CounterObjectCache](/docs/api.md#CounterObjectCache)
  - [reselectConnect](/docs/api.md#reselectConnect)
  - [once](/docs/api.md#once)

# Credits

Reselect-Utils was originally created by Sergei Grishchenko and inspired by projects such as [Reselect](https://github.com/reduxjs/reselect), [Re-reselect](https://github.com/toomuchdesign/re-reselect), [ts-optchain](https://github.com/rimeto/ts-optchain) and [Promises](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Promise).
