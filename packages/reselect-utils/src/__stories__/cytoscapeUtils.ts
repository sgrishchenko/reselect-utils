import cytoscape, { Core } from 'cytoscape';
import { Edges, Nodes } from 'reselect-tools';

// eslint-disable-next-line @typescript-eslint/no-var-requires
cytoscape.use(require('cytoscape-dagre'));

const dagreLayout = {
  name: 'dagre',
  rankDir: 'BT',
  ranker: 'longest-path',
  nodeDimensionsIncludeLabels: true,
};

const url = new URL(document.location.href);
const theme = url.searchParams.get('theme');

const cytoDefaults = {
  style: [
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        color: theme === 'dark' ? '#fff' : '#000',
        label: 'data(id)',
      },
    },

    {
      selector: 'edge',
      style: {
        width: 3,
        'line-color': theme === 'dark' ? '#444' : '#ccc',
        'target-arrow-color': theme === 'dark' ? '#444' : '#ccc',
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

export const drawCytoscapeGraph = (cyElement: HTMLElement | null) => {
  return cytoscape({
    ...cytoDefaults,
    container: cyElement,
  });
};

export const updateCytoscapeGraph = (cy: Core, nodes: Nodes, edges: Edges) => {
  const elements = createCytoElements(nodes, edges);
  cy.json({ elements });
  cy.layout(dagreLayout).run();
};
