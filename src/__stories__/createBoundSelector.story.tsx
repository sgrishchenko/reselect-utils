import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createStructuredSelector } from 'reselect';
// @ts-ignore
import { selectorGraph, registerSelectors, reset } from 'reselect-tools';
import SelectorGraph from './SelectorGraph';
import { Message, Person, State } from '../__data__/state';
import createBoundSelector from '../createBoundSelector';

const getPerson = (state: State, props: { id: number }) =>
  state.persons[props.id];
const getMessage = (state: State, props: { id: number }) =>
  state.messages[props.id];

type PersonAndMessage = {
  person: Person;
  message: Message;
};

storiesOf('createBoundSelector', module).add('example', () => {
  const getMarryAndHello = createStructuredSelector<State, PersonAndMessage>({
    person: createBoundSelector(getPerson, { id: 1 }),
    message: createBoundSelector(getMessage, { id: 100 }),
  });

  reset();
  registerSelectors({
    getPerson,
    getMessage,
    getMarryAndHello,
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
