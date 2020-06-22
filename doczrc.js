export default {
  title: 'Reselect Utils',
  description: 'A collection of helpers and utilities for selectors',
  dest: 'docz',
  base: '/reselect-utils/docz/',
  ignore: ['README.md', 'packages/**', 'docs/api/*'],
  typescript: true,
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
        { name: 'Structured & Sequence Selectors' },
        { name: 'Chain & Empty Selectors' },
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
    {
      name: 'API',
      menu: [
        { name: 'Path Selector' },
        { name: 'Prop Selector' },
        { name: 'Bound Selector' },
        { name: 'Empty Selector' },
        { name: 'Adapted Selector' },
        { name: 'Structured Selector' },
        { name: 'Cached Structured Selector' },
        { name: 'Sequence Selector' },
        { name: 'Cached Sequence Selector' },
        { name: 'Chain Selector' },
        { name: 'Composing Key Selector Creator' },
        { name: 'Compose Key Selectors' },
      ],
    },
  ],
};
