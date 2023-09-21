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
    gitTimestamp({ timestamp }) {
        const { locale, asPath } = useRouter();

        if (asPath !== '/') {
            return (
                <>
                    Last updated on:{' '}
                    <time dateTime={timestamp.toISOString()}>
                        {timestamp.toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </time>
                </>
            );
        }
    },
};

export default config;
