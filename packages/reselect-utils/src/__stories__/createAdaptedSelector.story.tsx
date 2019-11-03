import React, { useEffect, useState } from 'react';
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
import { createAdaptedSelector } from '../createAdaptedSelector';
import { createStructuredSelector } from '../createStructuredSelector';

const personSelector = (state: State, props: { id: number }) =>
  state.persons[props.id];
const messageSelector = (state: State, props: { id: number }) =>
  state.messages[props.id];

storiesOf('createAdaptedSelector', module).add('example', () => {
  const [nodes, setNodes] = useState<Nodes>({});
  const [edges, setEdges] = useState<Edges>([]);

  useEffect(() => {
    const personAndMessageSelector = createStructuredSelector({
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
