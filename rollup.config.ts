import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  external: ['reselect', 're-reselect'],
  plugins: [
    typescript({
      tsconfigOverride: {
        compilerOptions: {
          module: 'es2015',
        },
      },
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
        reselect: 'Reselect',
        're-reselect': 'Re-reselect',
      },
    },
  ],
};
