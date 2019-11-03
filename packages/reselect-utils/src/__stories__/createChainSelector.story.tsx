import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { createSelector, Selector } from 'reselect';
import {
  selectorGraph,
  registerSelectors,
  reset,
  Nodes,
  Edges,
} from 'reselect-tools';
import { SelectorGraph } from './SelectorGraph';
import { Message, Person, commonState, State } from '../__data__/state';
import { createBoundSelector } from '../createBoundSelector';
import { createSequenceSelector } from '../createSequenceSelector';
import { createChainSelector } from '../createChainSelector';

const personSelector = (state: State, props: { id: number }) =>
  state.persons[props.id];
const messageSelector = (state: State, props: { id: number }) =>
  state.messages[props.id];
const documentSelector = (state: State, props: { id: number }) =>
  state.documents[props.id];

const personsSelector = (state: State) => state.persons;

const fullNameSelector = createSelector(
  [personSelector],
  ({ firstName, secondName }) => `${firstName} ${secondName}`,
);

type ChainSelectorGraphProps = {
  nodes: Nodes;
  edges: Edges;
  onCallButtonClick: () => void;
};

const ChainSelectorGraph: FunctionComponent<ChainSelectorGraphProps> = ({
  nodes,
  edges,
  onCallButtonClick,
}) => {
  const containerStyle = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  };

  return (
    <div style={containerStyle}>
      <div>
        <button type="button" onClick={onCallButtonClick}>
          Call monadic selector
        </button>
      </div>
      <SelectorGraph
        nodes={nodes}
        edges={edges}
        onNodeClick={(name, node) => action(name)(node)}
        style={{ height: undefined, flexGrow: 1 }}
      />
    </div>
  );
};

storiesOf('createChainSelector', module)
  .add('entity chain example', () => {
    const [nodes, setNodes] = useState<Nodes>({});
    const [edges, setEdges] = useState<Edges>([]);

    const personByDocumentIdSelector = useMemo(
      () =>
        createChainSelector(documentSelector)
          .chain(document =>
            createBoundSelector(messageSelector, { id: document.messageId }),
          )
          .chain(message =>
            createBoundSelector(fullNameSelector, { id: message.personId }),
          )
          .build(),
      [],
    );

    useEffect(() => {
      reset();
      registerSelectors({
        personSelector,
        messageSelector,
        documentSelector,
        fullNameSelector,
        personByDocumentIdSelector,
      });

      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    }, [personByDocumentIdSelector]);

    const onCallButtonClick = () => {
      const personByDocumentId = personByDocumentIdSelector(commonState, {
        id: 111,
      });
      action('personByDocumentId')(personByDocumentId);

      registerSelectors({
        personByDocumentIdSelector,
      });
      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    };

    return (
      <ChainSelectorGraph
        nodes={nodes}
        edges={edges}
        onCallButtonClick={onCallButtonClick}
      />
    );
  })
  .add('aggregation example', () => {
    const [nodes, setNodes] = useState<Nodes>({});
    const [edges, setEdges] = useState<Edges>([]);

    const longestFullNameSelector = useMemo(
      () =>
        createChainSelector(personsSelector)
          .chain(persons =>
            createSequenceSelector(
              Object.values(persons).map((person: Person) =>
                createBoundSelector(fullNameSelector, { id: person.id }),
              ),
            ),
          )
          .map(fullNames =>
            fullNames.reduce((longest, current) =>
              current.length > longest.length ? current : longest,
            ),
          )
          .build(),
      [],
    );

    useEffect(() => {
      reset();
      registerSelectors({
        personSelector,
        personsSelector,
        fullNameSelector,
        longestFullNameSelector,
      });

      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    }, [longestFullNameSelector]);

    const onCallButtonClick = () => {
      const longestFullName = longestFullNameSelector(commonState);
      action('longestFullName')(longestFullName);

      registerSelectors({
        longestFullNameSelector,
      });
      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    };

    return (
      <ChainSelectorGraph
        nodes={nodes}
        edges={edges}
        onCallButtonClick={onCallButtonClick}
      />
    );
  })

  .add('switch dependency example', () => {
    const [nodes, setNodes] = useState<Nodes>({});
    const [edges, setEdges] = useState<Edges>([]);
    const [documentId, setDocumentId] = useState(111);

    const personOrMessageByDocumentIdSelector = useMemo(
      () =>
        createChainSelector(documentSelector)
          .chain(
            document =>
              (document.messageId === 100
                ? createBoundSelector(personSelector, { id: 1 })
                : createBoundSelector(messageSelector, {
                    id: document.messageId,
                  })) as Selector<State, Person | Message>,
          )
          .build(),
      [],
    );

    useEffect(() => {
      reset();
      registerSelectors({
        personSelector,
        messageSelector,
        documentSelector,
        personOrMessageByDocumentIdSelector,
      });

      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    }, [personOrMessageByDocumentIdSelector]);

    const onCallButtonClick = () => {
      const personOrMessageByDocumentId = personOrMessageByDocumentIdSelector(
        commonState,
        {
          id: documentId,
        },
      );

      setDocumentId(documentId === 111 ? 222 : 111);

      action('personOrMessageByDocumentId')(personOrMessageByDocumentId);

      registerSelectors({
        personOrMessageByDocumentIdSelector,
      });
      const graph = selectorGraph();

      setNodes(graph.nodes);
      setEdges(graph.edges);
    };

    return (
      <ChainSelectorGraph
        nodes={nodes}
        edges={edges}
        onCallButtonClick={onCallButtonClick}
      />
    );
  });
