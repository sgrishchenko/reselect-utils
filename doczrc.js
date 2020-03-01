export default {
  title: 'Reselect Utils',
  src: 'docs',
  dest: 'docz-static',
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
        { name: 'Sequence & Structured Selectors' },
        { name: 'Chain Selector' },
        { name: 'Composing Key Selector Creator' },
      ],
    },
  ],
};
