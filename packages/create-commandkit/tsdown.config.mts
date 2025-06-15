import createConfig from '../../tsdown.config';

export default createConfig({
  format: ['esm'],
  entry: ['./src/index.ts'],
  sourcemap: false,
  dts: false,
  minify: true,
});
