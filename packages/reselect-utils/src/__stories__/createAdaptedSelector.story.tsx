import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createStructuredSelector } from 'reselect';
import { selectorGraph, registerSelectors, reset } from 'reselect-tools';
import { SelectorGraph } from './SelectorGraph';
import { Message, Person, State } from '../__data__/state';
import { createAdaptedSelector } from '../createAdaptedSelector';

const personSelector = (state: State, props: { id: number }) =>
  state.persons[props.id];
const messageSelector = (state: State, props: { id: number }) =>
  state.messages[props.id];

type PersonAndMessageProps = {
  personId: number;
  messageId: number;
};

type PersonAndMessage = {
  person: Person;
  message: Message;
};

storiesOf('createAdaptedSelector', module).add('example', () => {
  const personAndMessageSelector = createStructuredSelector<
    State,
    PersonAndMessageProps,
    PersonAndMessage
  >({
    person: createAdaptedSelector(
      personSelector,
      (props: { personId: number }) => ({
        id: props.personId,
      }),
    ),
    message: createAdaptedSelector(
      messageSelector,
      (props: { messageId: number }) => ({
        id: props.messageId,
      }),
    ),
  });

  reset();
  registerSelectors({
    personSelector,
    messageSelector,
    personAndMessageSelector,
  });

  const { nodes, edges } = selectorGraph();
  return (
    <SelectorGraph
      nodes={nodes}
      edges={edges}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
