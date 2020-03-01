import { Configuration } from 'webpack';

export default async ({ config }: { config: Configuration }) => {
  config.module?.rules.push({
    test: /\.tsx?$/,
    loader: 'ts-loader',
  });

  config.resolve?.extensions?.push('.ts', '.tsx');

  return config;
};
