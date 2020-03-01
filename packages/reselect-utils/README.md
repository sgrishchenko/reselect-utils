# Reselect-Utils

[![build status](https://img.shields.io/travis/com/sgrishchenko/reselect-utils/master.svg?style=flat-square)](https://travis-ci.com/sgrishchenko/reselect-utils)
[![coverage status](https://img.shields.io/coveralls/sgrishchenko/reselect-utils/master.svg?style=flat-square)](https://coveralls.io/github/sgrishchenko/reselect-utils?branch=master)
[![npm version](https://img.shields.io/npm/v/reselect-utils.svg?style=flat-square)](https://www.npmjs.com/package/reselect-utils)
[![github license](https://img.shields.io/github/license/sgrishchenko/reselect-utils.svg?style=flat-square)](https://github.com/sgrishchenko/reselect-utils/blob/master/LICENSE)

## Install

Install from the NPM repository using yarn or npm:

```shell
yarn add reselect-utils
```

```shell
npm install reselect-utils
```

## Motivation

Such projects as [Reselect](https://github.com/reduxjs/reselect) and [Re-reselect](https://github.com/toomuchdesign/re-reselect) try to solve the task of memoization. But there is no standard solutions for some applied problems. This library was created to try to systematically solve the following problems:

- Work with optional objects as a source for selection.
- Binding parametric selectors to specific property values.
- Adaptation of parametric selectors to the new parameter interface (useful for creating parametric [structured selectors](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector)).
- Using selection results as parameters for a new selection.
- Calculating the aggregate value from a collection of selector results.
- Structuring of selection results (more proper typed version of [structured selector](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector) and [cached structured selector](https://github.com/toomuchdesign/re-reselect#createStructuredCachedSelector)).
- Implementation of key selectors composition implementation (useful for [key selector creator](https://github.com/toomuchdesign/re-reselect#keyselectorcreator) usages).

[Main Documentation](https://github.com/sgrishchenko/reselect-utils#documentation)
