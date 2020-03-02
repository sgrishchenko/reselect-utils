import { Configuration, DefinePlugin  } from 'webpack';

export default {
  stories: ['../packages/**/*.story.tsx'],
  addons: ['@storybook/addon-actions/register'],
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

    return config;
  },
};
