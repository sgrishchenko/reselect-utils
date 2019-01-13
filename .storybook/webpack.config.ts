import { Configuration } from 'webpack';

const config: Configuration = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
};

export default config;
