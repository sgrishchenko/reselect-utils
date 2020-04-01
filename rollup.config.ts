import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: ['reselect', 're-reselect'],
  plugins: [typescript()],
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      sourcemap: true,
      exports: 'named',
      name: 'ReselectUtils',
      globals: {
        reselect: 'Reselect',
        're-reselect': 'Re-reselect',
      },
    },
  ],
};
