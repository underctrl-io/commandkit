import type { DocsThemeConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';

const config: DocsThemeConfig = {
    logo: <span>CommandKit</span>,
    project: {
        link: 'https://github.com/underctrl-io/commandkit',
    },
    docsRepositoryBase: 'https://github.com/underctrl-io/commandkit/blob/apps/docs',
    useNextSeoProps() {
        const { asPath } = useRouter();
        if (asPath !== '/') {
            return {
                titleTemplate: '%s – CommandKit',
            };
        }
    },
};

export default config;
