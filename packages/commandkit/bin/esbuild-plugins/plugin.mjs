import { MacroTransformer } from 'use-macro';
import { cacheDirectivePlugin } from './use-cache.mjs';
import { readFile } from 'node:fs/promises';

const defaultConfig = {
  'use-macro': true,
  'use-cache': true,
};

/**
 * @typedef {Object} CommandKitEsbuildPluginConfig
 * @property {boolean} [use-macro]
 * @property {boolean} [use-cache]
 */

/**
 * @param {CommandKitEsbuildPluginConfig} [config]
 */
export const commandkitPlugin = (config) => {
  config = Object.assign({}, defaultConfig, config);

  const plugins = [
    {
      name: 'use-macro',
      plugin: async (content, args) => {
        const transformer = new MacroTransformer();
        const { contents } = await transformer.transform(content, args.path);
        return contents;
      },
    },
    {
      name: 'use-cache',
      plugin: async (content, args) => {
        const { contents } = await cacheDirectivePlugin(content, args);
        return contents;
      },
    },
  ].filter((p) => {
    return !!config[p.name];
  });

  return {
    name: 'commandkit-transformer-plugin',
    setup(build) {
      if (!plugins.length) return;

      const fileFilter = /\.(c|m)?(t|j)sx?$/;

      build.onLoad({ filter: fileFilter }, async (args) => {
        const source = await readFile(args.path, 'utf8');
        const loader = args.path.split('.').pop();

        let contents = source;

        for (const _plugin of plugins) {
          const { plugin, name } = _plugin;
          try {
            contents = await plugin(contents, args);
          } catch (e) {
            const err = new Error(`Plugin ${name} failed with ${e}`);
            err.stack = e.stack;

            throw err;
          }
        }

        return {
          contents,
          loader,
        };
      });
    },
  };
};
