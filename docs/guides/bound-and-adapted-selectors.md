---
name: Bound & Adapted Selectors
menu: Guides
route: '/guides/bound-and-adapted-selectors'
---

# Bound & Adapted Selectors

Some times you may need to bind your parametric selector with certain fixed properties. There is `Bound Selector` helper for this cases. For example, you have this normalized state:

```js
const state = {
  messages: {
    input: {
      100: {
        id: 100,
        text: 'Hello',
      },
      200: {
        id: 200,
        text: 'Buy',
      },
    },
    output: {
      100: {
        id: 100,
        text: 'How are you?',
      },
      200: {
        id: 200,
        text: 'I am fine, and you?',
      },
    },
  },
};
```

And you have this selector:

```typescript
import createCachedSelector from 're-reselect';
import { path, prop } from 'reselect-utils';

const messagesSelector = (state: State) => state.messages;

const messageSelector = createCachedSelector(
  messagesSelector,
  prop<Props>().messageType(),
  prop<Props>().messageId(),
  (messages, messageType, messageId) => messages[messageType][messageId],
)({
  keySelector: (state, props) => `${props.messageType}:${props.messageId}`,
});
```

You can create selector only for input or output messages using `Bound Selector`:

```typescript
import { createBoundSelector, bound } from 'reselect-utils';

const inputMessageSelector = createBoundSelector(messageSelector, {
  messageType: 'input',
});

inputMessageSelector(state, { messageId: 100 }); // => { text: 'Hello', ... }

const outputMessageSelector = bound(messageSelector, { messageType: 'output' });

outputMessageSelector(state, { messageId: 100 }); // => { text: 'How are you?', ... }
```

There is another problem with parametric selectors. Sometimes you have one interface of props but interface of selector you need is different. With `Adapted Selector` helper you can switch shape of selector properties. Imagine, that you need to write next selector:

```typescript
messageDiffSelector(state, { sourceMessageId, targetMessageId });
```

You can create it this way:

```typescript
import createCachedSelector from 're-reselect';
import { createAdaptedSelector, adapt } from 'reselect-utils';

const sourceMessageSelector = createAdaptedSelector(
  inputMessageSelector,
  (props: { sourceMessageId: number }) => ({
    messageId: props.sourceMessageId,
  }),
);

const targetMessageSelector = adapt(
  outputMessageSelector,
  (props: { targetMessageId: number }) => ({
    messageId: props.targetMessageId,
  }),
);

const messageDiffSelector = createCachedSelector(
  sourceMessageSelector,
  targetMessageSelector,
  (sourceMessage, targetMessage) => ({
    sourceMessage,
    targetMessage,
  }),
)({
  keySelector: (state, props) =>
    `${props.sourceMessageId}:${props.targetMessageId}`,
});
```
