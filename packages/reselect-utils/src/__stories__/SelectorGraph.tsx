import React, {
  CSSProperties,
  FunctionComponent,
  useEffect,
  useRef,
} from 'react';
import { Core as CytoscapeCore } from 'cytoscape';
import { Edges, Nodes, CheckResult, checkSelector } from 'reselect-tools';
import { drawCytoscapeGraph, updateCytoscapeGraph } from './cytoscapeUtils';

export type SelectorGraphProps = {
  nodes: Nodes;
  edges: Edges;
  onNodeClick: (name: string, node: CheckResult) => void;
  style?: CSSProperties;
};

export const SelectorGraph: FunctionComponent<SelectorGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  style,
}) => {
  const cy = useRef<CytoscapeCore>();
  const cyElement = useRef<HTMLDivElement>(null);

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

  return <div style={{ height: '100%', ...style }} ref={cyElement} />;
};
