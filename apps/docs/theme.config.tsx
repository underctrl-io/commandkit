import type { DocsThemeConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';
import Image from 'next/image';

const config: DocsThemeConfig = {
    logo: (
        <div className="flex items-center gap-2">
            <Image src="/favicon.png" alt="CommandKit Favicon" width={30} height={30} />
            <span className="font-bold">CommandKit</span>
        </div>
    ),
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
    footer: {
        text: (
            <span>
                MIT {new Date().getFullYear()} ©{' '}
                <a href="https://github.com/underctrl-io/commandkit" target="_blank">
                    CommandKit
                </a>
                .
            </span>
        ),
    },
    darkMode: false,
    nextThemes: {
        defaultTheme: 'dark',
    },
};

export default config;
