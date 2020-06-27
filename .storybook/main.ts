import { Configuration, DefinePlugin } from 'webpack';

export default {
  stories: ['../packages/**/*.story.tsx'],
  addons: [
    '@storybook/addon-actions',
    {
      name: '@storybook/addon-storysource',
      options: {
        rule: {
          test: [/\.story\.tsx?$/],
        },
      },
    },
  ],
  webpackFinal: async (config: Configuration) => {
    config.module?.rules.push({
      test: /\.tsx?$/,
      loader: 'ts-loader',
    });

    config.resolve?.extensions?.push('.ts', '.tsx');

    config.plugins?.unshift(
      new DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    );

    if (config.performance) {
      config.performance.hints = false;
    }

    return config;
  },
};
