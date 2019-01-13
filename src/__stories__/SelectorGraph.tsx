import React, { CSSProperties } from 'react';
import { Core as CytoscapeCore } from 'cytoscape';
// @ts-ignore
import { checkSelector } from 'reselect-tools';
import { Edges, Nodes, Node } from './types';
import { drawCytoscapeGraph, updateCytoscapeGraph } from './cytoscapeUtils';
/* tslint:disable:member-ordering */

export type SelectorGraphProps = {
  nodes: Nodes;
  edges: Edges;
  onNodeClick: (name: string, node: Node) => void;
  style: CSSProperties;
};

export default class SelectorGraph extends React.Component<SelectorGraphProps> {
  public static defaultProps = {
    onNodeClick: () => undefined,
    style: {},
  };

  public componentDidMount() {
    const { nodes, edges, onNodeClick } = this.props;

    this.cy = drawCytoscapeGraph(this.cyElement, nodes, edges, name => {
      onNodeClick(name, checkSelector(name));
    });
  }

  public componentDidUpdate(prevProps: SelectorGraphProps) {
    const { nodes, edges } = this.props;

    if (prevProps.nodes === nodes && prevProps.edges === edges) {
      return;
    }

    updateCytoscapeGraph(this.cy, nodes, edges);
  }

  public componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  private setCyElement = (element: HTMLElement | null) => {
    this.cyElement = element;
  };

  private cy!: CytoscapeCore;

  private cyElement!: HTMLElement | null;

  public render() {
    const { style } = this.props;
    return <div style={{ height: '100%', ...style }} ref={this.setCyElement} />;
  }
}
