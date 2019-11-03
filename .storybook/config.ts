import { configure } from '@storybook/react';

const req = require.context(
  '..',
  true,
  /packages\/((?!node_modules).)*\.story\.tsx$/,
);

const loadStories = () => req.keys().forEach(req);

configure(loadStories, module);
