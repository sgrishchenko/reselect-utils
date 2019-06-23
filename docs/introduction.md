# Introduction

## Motivation

Such projects as [Reselect](https://github.com/reduxjs/reselect) and [Re-reselect](https://github.com/toomuchdesign/re-reselect) try to solve the task of memoization. But for some applied problems there is no standard solution published. This library was created to try to systematically solve the following problems:

- Work with optional objects as a source for selection.
- Binding parametric selectors to specific property values.
- Adaptation of parametric selectors to the new parameter interface (useful when creating parametric [structured selectors](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector)).
- Using selection results as parameters for a new selection.
- Calculating the aggregate value from a collection of selector results.
- Dynamic memory management strategy when using [cached selectors](https://github.com/toomuchdesign/re-reselect#api).

## Principles

### Dev Tool Integration

All utility selectors should be adequately displayed in [dev tools](https://github.com/skortchmark9/reselect-tools). This is necessary to understand how the selector is related.

### Dependency Support

In order to be able to automatically control the allocated memory for caching, all selectors must correctly describe their dependencies. Otherwise, the dependency chain may break and a memory leak will occur.

### TypeScript Support

This library is written in a [TypeScript](https://www.typescriptlang.org/) and initially focused on static type checking. All utility selectors are typed and tested at compile time with the help of tests.
