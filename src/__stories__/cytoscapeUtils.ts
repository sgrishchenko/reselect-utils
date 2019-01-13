import cytoscape, { Core } from 'cytoscape';
// @ts-ignore
import dagre from 'cytoscape-dagre';
import { Edges, Nodes } from './types';

cytoscape.use(dagre);

const dagreLayout = {
  name: 'dagre',
  rankDir: 'BT',
  ranker: 'longest-path',
  nodeDimensionsIncludeLabels: true,
};

const cytoDefaults = {
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        label: 'data(id)',
      },
    },

    {
      selector: 'edge',
      style: {
        width: 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
      },
    },
  ],

  layout: dagreLayout,
};

export const createCytoElements = (nodes: Nodes, edges: Edges) => {
  const cytoNodes = Object.entries(nodes).map(([name, node]) => ({
    data: {
      id: name,
      ...node,
    },
  }));

  const cytoEdges = edges.map((edge, index) => ({
    data: {
      id: `${index}`,
      source: edge.from,
      target: edge.to,
    },
  }));

  return [...cytoNodes, ...cytoEdges];
};

export const drawCytoscapeGraph = (
  cyElement: HTMLElement | null,
  nodes: Nodes,
  edges: Edges,
  onNodeClick: (nodeName: string) => void,
) => {
  const elements = createCytoElements(nodes, edges);

  const cy = cytoscape({
    ...cytoDefaults,
    container: cyElement,
    elements,
  });

  cy.nodes().on('click', event => {
    onNodeClick(event.target.data().name);
  });

  return cy;
};

export const updateCytoscapeGraph = (cy: Core, nodes: Nodes, edges: Edges) => {
  const elements = createCytoElements(nodes, edges);
  cy.json({ elements });
  cy.layout(dagreLayout).run();
};
