---
name: Introduction
route: '/introduction'
---

# Introduction

## Motivation

Such projects as [Reselect](https://github.com/reduxjs/reselect) and [Re-reselect](https://github.com/toomuchdesign/re-reselect) try to solve the task of memoization. But there is no standard solutions for some applied problems. This library was created to try to systematically solve the following problems:

- Work with optional objects as a source for selection.
- Binding parametric selectors to specific property values.
- Adaptation of parametric selectors to the new parameter interface (useful for creating parametric [structured selectors](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector)).
- Using selection results as parameters for a new selection.
- Calculating an aggregate value from a collection of selector results.
- Structuring of selection results (more proper typed version of [structured selector](https://github.com/reduxjs/reselect#createstructuredselectorinputselectors-selectorcreator--createselector) and [cached structured selector](https://github.com/toomuchdesign/re-reselect#createStructuredCachedSelector)).
- Implementation of key selectors composition implementation (useful for [key selector creator](https://github.com/toomuchdesign/re-reselect#keyselectorcreator) usages).

## Principles

### Dev Tool Integration

All utility selectors should be displayed in [dev tools](https://github.com/skortchmark9/reselect-tools) adequately. This is necessary to understand how the selector is related.

### Dependency Support

All selectors must describe their dependencies correctly.

### TypeScript Support

This library is written in [TypeScript](https://www.typescriptlang.org/) and initially focused on static type checking. All utility selectors are typed and tested at compile time.
