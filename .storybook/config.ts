import { configure } from '@storybook/react';

const req = require.context('../src/__stories__', true, /\.story\.tsx$/);

const loadStories = () => req.keys().forEach(req);

configure(loadStories, module);
