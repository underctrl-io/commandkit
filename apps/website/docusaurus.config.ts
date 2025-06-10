import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const UPPERCASE = new Set(['jsx', 'cli', 'api', 'ai']);

const maybeUpperCase = (str: string) => {
  const chunks = str.split(' ');
  return chunks
    .map((chunk) => {
      if (UPPERCASE.has(chunk.toLowerCase())) {
        return chunk.toUpperCase();
      }

      return chunk;
    })
    .join(' ');
};

const config: Config = {
  title: 'CommandKit',
  tagline: 'A Discord.js handler',
  favicon: 'img/favicon.ico',
  url: 'https://commandkit.dev',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), { sync: true }],
          ],
          editUrl:
            'https://github.com/underctrl-io/commandkit/tree/main/apps/website/',
          sidebarItemsGenerator: async (args) => {
            const items = await args.defaultSidebarItemsGenerator(args);

            const transform = (item: any) => {
              if (item.type === 'category') {
                return {
                  ...item,
                  label: UPPERCASE.has(item.label?.toLowerCase())
                    ? item.label.toUpperCase()
                    : maybeUpperCase(
                        item.label
                          .replace(/-/g, ' ')
                          .replace(/\b\w/g, (char) => char.toUpperCase()),
                      ),
                  items: item?.items?.map?.(transform),
                };
              }

              return item;
            };

            return items.map(transform);
          },
        },
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/layout.css',
            './src/css/overrides.css',
          ],
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items.filter((item) => !item.url.includes('/page/'));
          },
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: true,
      },
    },
    algolia: {
      appId: 'S9ZEIJ6SBS',
      apiKey: '6f7582f462a448cf1f47a56901595e6e',
      indexName: 'commandkit-js',
      contextualSearch: true,
      insights: false,
    },
    colorMode: {
      defaultMode: 'dark',
    },
    navbar: {
      title: 'CommandKit',
      logo: {
        alt: 'CommandKit logo',
        src: 'img/logo_128.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'guide',
          position: 'left',
          label: 'Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'api',
          position: 'left',
          label: 'API Reference',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/underctrl-io/commandkit',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://ctrl.lol/discord',
          label: 'Discord',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      copyright: `
      <a
        href="https://www.netlify.com?utm_source=commandkit"
        target="_blank"
        rel="noopener noreferrer"
        className="mx-auto"
      >
        <img
          src="https://www.netlify.com/v3/img/components/netlify-color-accent.svg"
          alt="Deploys by Netlify"
        />
      </a>
      <br/>
      <br/>
      MIT © ${new Date().getFullYear()} CommandKit`,
    },
    prism: {
      theme: prismThemes.vsLight,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
  plugins: [
    function tailwindPlugin(context, options) {
      return {
        name: 'tailwind-plugin',
        configurePostCss(postcssOptions) {
          postcssOptions.plugins = [
            require('postcss-import'),
            require('tailwindcss'),
            require('autoprefixer'),
          ];
          return postcssOptions;
        },
      };
    },
    require('./src/plugins/llms-txt.js'),
  ],
};

export default config;
