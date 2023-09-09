import { defineConfig } from 'astro/config';
import { generateTypeDoc } from 'starlight-typedoc';
import starlight from '@astrojs/starlight';
import path from 'path';

const typeDocSidebarGroup = await generateTypeDoc({
    entryPoints: [
        path.join(process.cwd(), '..', '..', 'packages', 'commandkit', 'src', 'index.ts'),
    ],
    tsconfig: path.join(process.cwd(), '..', '..', 'packages', 'commandkit', 'tsconfig.json'),
});

// https://astro.build/config
export default defineConfig({
    site: 'https://commandkit.underctrl.io',
    integrations: [
        starlight({
            title: '',
            favicon: '/favicon.png',
            logo: {
                dark: './src/assets/nav_logo.png',
                light: './src/assets/nav_logo_light.png',
            },
            editLink: {
                baseUrl: 'https://github.com/underctrl-io/commandkit-docs/edit/master/',
            },
            customCss: ['./src/styles/landing.css', './src/styles/custom.css'],
            lastUpdated: true,
            social: {
                github: 'https://github.com/underctrl-io/commandkit',
                discord: 'https://discord.underctrl.io',
                youtube: 'https://youtube.com/@UnderCtrl',
            },
            sidebar: [
                { label: 'Overview', link: '/overview' },
                {
                    label: 'Guides',
                    items: [
                        { label: 'Installation', link: '/guides/installation' },
                        { label: 'CommandKit Setup', link: '/guides/commandkit-setup' },
                        { label: 'Commands Setup', link: '/guides/command-file-setup' },
                        { label: 'Events Setup', link: '/guides/event-file-setup' },
                        { label: 'Validations Setup', link: '/guides/validation-file-setup' },
                        {
                            label: 'Migrate from DJS-Commander',
                            link: '/guides/migrating-from-djs-commander',
                        },
                    ],
                },
                typeDocSidebarGroup,
            ],
        }),
    ],

    // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
    image: { service: { entrypoint: 'astro/assets/services/sharp' } },
});
