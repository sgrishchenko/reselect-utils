export default {
  title: 'Reselect Utils',
  description: 'A collection of helpers and utilities for selectors',
  src: 'docs',
  dest: 'docz',
  base: '/reselect-utils/docz/',
  ignore: ['docs/api/*'],
  themeConfig: {
    mode: 'light',
  },
  menu: [
    { name: 'Introduction' },
    { name: 'Quick Start' },
    {
      name: 'Guides',
      menu: [
        { name: 'Path & Prop Selectors' },
        { name: 'Bound & Adapted Selectors' },
        // { name: 'Sequence & Structured Selectors' },
        // { name: 'Chain Selector' },
        // { name: 'Composing Key Selector Creator' },
      ],
    },
    {
      name: 'Graphs',
      menu: [
        { name: 'Path Selector' },
        { name: 'Bound Selector' },
        { name: 'Adapted Selector' },
        { name: 'Chain Selector' },
      ],
    },
  ],
};
