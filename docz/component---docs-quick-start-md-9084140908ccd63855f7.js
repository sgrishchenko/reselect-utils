(window.webpackJsonp=window.webpackJsonp||[]).push([[26],{HhXU:function(e,t,n){"use strict";n.r(t),n.d(t,"_frontmatter",(function(){return c})),n.d(t,"default",(function(){return i}));var a=n("Fcif"),s=n("+I+c"),r=(n("mXGw"),n("/FXl")),o=n("TjRS"),c=(n("aD51"),{});void 0!==c&&c&&c===Object(c)&&Object.isExtensible(c)&&!c.hasOwnProperty("__filemeta")&&Object.defineProperty(c,"__filemeta",{configurable:!0,value:{name:"_frontmatter",filename:"docs/quick-start.md"}});var l={_frontmatter:c},p=o.a;function i(e){var t=e.components,n=Object(s.a)(e,["components"]);return Object(r.b)(p,Object(a.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h1",{id:"quick-start"},"Quick Start"),Object(r.b)("h2",{id:"path-selector"},"Path Selector"),Object(r.b)("p",null,"Suppose you have such a normalized state:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const state = {\n  persons: {\n    1: {\n      id: 1,\n      firstName: 'Marry',\n      secondName: 'Poppins',\n    },\n    2: {\n      id: 2,\n      firstName: 'Harry',\n      secondName: 'Potter',\n    },\n  },\n};\n")),Object(r.b)("p",null,"And you want to build something like this selector:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const personFullNameSelector = createSelector(\n  (state, props) => state.persons[props.personId].firstName,\n  (state, props) => state.persons[props.personId].secondName,\n  (firstName, secondName) => `${firstName} ${secondName}`,\n);\n")),Object(r.b)("p",null,"As you can see in the dependencies of this selector quite a lot of boilerplate code. The problem of duplicate code can be solved with ",Object(r.b)("inlineCode",{parentName:"p"},"createPathSelector"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import { createPathSelector } from 'reselect-utils';\n\nconst personSelector = (state, props) => state.persons[props.personId];\n\nconst personFullNameSelector = createSelector(\n  createPathSelector(personSelector).firstName(),\n  createPathSelector(personSelector).secondName(),\n  (firstName, secondName) => `${firstName} ${secondName}`,\n);\n")),Object(r.b)("p",null,"You can also add default values if you want the selector to produce an adequate result even in the absence of the necessary ",Object(r.b)("inlineCode",{parentName:"p"},"person")," in the ",Object(r.b)("inlineCode",{parentName:"p"},"state"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import { createPathSelector } from 'reselect-utils';\n\nconst personFullNameSelector = createSelector(\n  createPathSelector(personSelector).firstName('John'),\n  createPathSelector(personSelector).secondName('Doe'),\n  (firstName, secondName) => `${firstName} ${secondName}`,\n);\n")),Object(r.b)("p",null,"There are short aliases for many helpers in this library, so you can re-write your code like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import { path } from 'reselect-utils';\n\nconst personFullNameSelector = createSelector(\n  path(personSelector).firstName('John'),\n  path(personSelector).secondName('Doe'),\n  (firstName, secondName) => `${firstName} ${secondName}`,\n);\n")),Object(r.b)("p",null,"You can also work with objects of unlimited nesting:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import { path } from 'reselect-utils';\n\nconst personSelectorInfo = createSelector(\n  path(personSelector).address.street('-'),\n  path(personSelector).some.very.deep.field(123),\n  (street, field) => ({ street, field }),\n);\n")),Object(r.b)("p",null,"A more detailed description can be found ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"/reselect-utils/docz/guides/path-and-prop-selectors"}),"here"),"."),Object(r.b)("h2",{id:"chain-selector"},"Chain Selector"),Object(r.b)("p",null,"Suppose you have such a normalized state:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const state = {\n  persons: {\n    1: {\n      id: 1,\n      firstName: 'Marry',\n      secondName: 'Poppins',\n    },\n    2: {\n      id: 2,\n      firstName: 'Harry',\n      secondName: 'Potter',\n    },\n  },\n\n  messages: {\n    100: {\n      id: 100,\n      personId: 1,\n      text: 'Hello',\n    },\n    200: {\n      id: 200,\n      personId: 2,\n      text: 'Buy',\n    },\n  },\n};\n")),Object(r.b)("p",null,"And you want to select a person by the message id. You can write something like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"const personSelectorByMessageId = (state, props) => {\n  const message = state.messages[props.messageId];\n\n  return state.persons[message.personId];\n};\n")),Object(r.b)("p",null,"This is an acceptable solution, but what if the chain is longer? ",Object(r.b)("inlineCode",{parentName:"p"},"Chain Selector")," will help to solve such problems:"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-js"}),"import { chain, bound } from 'reselect-utils';\n\nconst messageSelector = (state, props) => state.messages[props.messageId];\nconst personSelector = (state, props) => state.persons[props.personId];\n\nconst personByMessageIdSelector = chain(messageSelector)\n  .chain((message) => bound(personSelector, { personId: message.personId }))\n  .build();\n")),Object(r.b)("p",null,Object(r.b)("inlineCode",{parentName:"p"},"Chain Selector")," allows you to create dynamic selectors that depend on the current state. Moreover, the callback that is passed to the ",Object(r.b)("inlineCode",{parentName:"p"},"chain")," method is cached by input parameters. ",Object(r.b)("inlineCode",{parentName:"p"},"bound")," binds the selector to specific parameter values and turns a parametric selector into an non parametric. And at the end you must call the ",Object(r.b)("inlineCode",{parentName:"p"},"build")," method to get the normal selector. It’s like a chain of ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise"}),"Promises"),". ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"/reselect-utils/docz/guides/chain-and-empty-selectors"}),"Chain Selector")," and ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"/reselect-utils/docz/guides/bound-and-adapted-selectors"}),"Bound Selector")," are described in detail in Guides section."))}void 0!==i&&i&&i===Object(i)&&Object.isExtensible(i)&&!i.hasOwnProperty("__filemeta")&&Object.defineProperty(i,"__filemeta",{configurable:!0,value:{name:"MDXContent",filename:"docs/quick-start.md"}}),i.isMDXComponent=!0}}]);
//# sourceMappingURL=component---docs-quick-start-md-9084140908ccd63855f7.js.map