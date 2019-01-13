import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.ts',
  external: ['react', 'react-redux'],
  plugins: [
    resolve({
      extensions: ['.ts', '.tsx'],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.ts', '.tsx'],
    }),
  ],
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'ReselectUtils',
      globals: {
        react: 'React',
        'react-redux': 'ReactRedux',
      },
    },
  ],
};
