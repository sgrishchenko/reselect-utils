import path from 'path';
import { Configuration } from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackTemplate from 'html-webpack-template';

const config: Configuration = {
  mode: 'development',

  devtool: 'source-map',

  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      inject: false,
      /* eslint-disable-next-line global-require */
      template: HtmlWebpackTemplate,
      appMountId: 'root',
      title: 'Redux Todos Example',
    }),
  ],
};

export default config;
