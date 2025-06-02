import { defineConfig } from 'tsdown';
import { MacroTransformer } from 'use-macro';

const macro = new MacroTransformer();

export default defineConfig({
  format: ['cjs'],
  entry: ['src'],
  outDir: './dist',
  sourcemap: true,
  watch: false,
  minify: false,
  dts: true,
  shims: false,
  skipNodeModulesBundle: true,
  clean: true,
  platform: 'node',
  target: 'node16',
  outputOptions: {
    exports: 'named',
  },
  silent: true,
  unbundle: false,
  plugins: [
    {
      name: 'macro',
      transform: {
        filter: {
          id: /\.(c|m)?(t|j)sx?$/,
        },
        async handler(code, id) {
          const result = await macro.transform(code, id);

          return {
            code: result.contents as string,
          };
        },
      },
    },
  ],
});
