import React, { useState, useEffect } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import {
  selectorGraph,
  registerSelectors,
  reset,
  Nodes,
  Edges,
} from 'reselect-tools';
import { SelectorGraph } from './SelectorGraph';
import { State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createStructuredSelector } from '../createStructuredSelector';

const personSelector = (state: State, props: { id: number }) =>
  state.persons[props.id];
const messageSelector = (state: State, props: { id: number }) =>
  state.messages[props.id];

storiesOf('createBoundSelector', module).add('example', () => {
  const [nodes, setNodes] = useState<Nodes>({});
  const [edges, setEdges] = useState<Edges>([]);

  useEffect(() => {
    const marryAndHelloSelector = createStructuredSelector({
      person: createBoundSelector(personSelector, { id: 1 }),
      message: createBoundSelector(messageSelector, { id: 100 }),
    });

    reset();
    registerSelectors({
      personSelector,
      messageSelector,
      marryAndHelloSelector,
    });

    const graph = selectorGraph();

    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [setNodes, setEdges]);

  return (
    <SelectorGraph
      nodes={nodes}
      edges={edges}
      onNodeClick={(name, node) => action(name)(node)}
    />
  );
});
