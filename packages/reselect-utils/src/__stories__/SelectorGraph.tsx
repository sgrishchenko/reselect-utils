import React, {
  CSSProperties,
  FunctionComponent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Core as CytoscapeCore } from 'cytoscape';
import {
  Edges,
  Nodes,
  CheckResult,
  checkSelector,
  reset,
  registerSelectors,
  selectorGraph,
  AnySelector,
} from 'reselect-tools';
import { drawCytoscapeGraph, updateCytoscapeGraph } from './cytoscapeUtils';

export type SelectorGraphProps = {
  selectors: Record<string, AnySelector>;
  onNodeClick: (name: string, node: CheckResult) => void;
  style?: CSSProperties;
};

export const SelectorGraph: FunctionComponent<SelectorGraphProps> = ({
  selectors,
  onNodeClick,
  style,
}) => {
  const [nodes, setNodes] = useState<Nodes>({});
  const [edges, setEdges] = useState<Edges>([]);

  const cy = useRef<CytoscapeCore>();
  const cyElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reset();
    registerSelectors(selectors);

    const graph = selectorGraph();

    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [selectors, setNodes, setEdges]);

  useEffect(() => {
    if (!cy.current) {
      cy.current = drawCytoscapeGraph(cyElement.current);
    }

    updateCytoscapeGraph(cy.current, nodes, edges);
  }, [cy, cyElement, nodes, edges]);

  useEffect(() => {
    if (cy.current) {
      cy.current.off('click', 'node');
      cy.current.on('click', 'node', event => {
        const { name } = event.target.data();
        onNodeClick(name, checkSelector(name));
      });
    }
  }, [cy, onNodeClick]);

  useEffect(
    () => () => {
      if (cy.current) {
        cy.current.destroy();
      }
    },
    [cy],
  );

  return (
    <div
      style={{ height: '100%', ...style }}
      ref={cyElement}
      title="Double Click to Reset"
      onDoubleClick={() =>
        cy.current && updateCytoscapeGraph(cy.current, nodes, edges)
      }
    />
  );
};
