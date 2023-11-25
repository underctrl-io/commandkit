import type { DocsThemeConfig } from 'nextra-theme-docs';
import { useConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';
import Image from 'next/image';

const config: DocsThemeConfig = {
    logo: (
        <div className="flex items-center gap-2">
            <Image src="/favicon.png" alt="CommandKit Favicon" width={30} height={30} />
            <span className="font-bold">CommandKit</span>
        </div>
    ),
    chat: {
        link: 'https://ctrl.lol/discord',
    },
    project: {
        link: 'https://github.com/underctrl-io/commandkit',
    },
    docsRepositoryBase: 'https://github.com/underctrl-io/commandkit/blob/master/apps/docs',
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
    head: (meta: any) => {
        const { frontMatter, title } = useConfig();
        const { asPath } = useRouter();

        let ogTitle = `${title} – CommandKit`;

        if (asPath === '/') {
            ogTitle = title;
        }

        const ogDescription = frontMatter.description || '';

        return (
            <>
                <meta content={ogTitle} property="og:title" />
                <meta content={ogDescription} property="og:description" />
                <meta content={asPath} property="og:url" />
                <meta content="/favicon.png" property="og:image" />
                <meta content="#fab259" data-react-helmet="true" name="theme-color" />
            </>
        );
    },
    footer: {
        text: (
            <span>
                MIT {new Date().getFullYear()} ©{' '}
                <a href="https://github.com/underctrl-io/commandkit" target="_blank">
                    Under Ctrl
                </a>
            </span>
        ),
    },
};

export default config;
