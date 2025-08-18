// borrowed from https://github.com/trpc/trpc/blob/ec5185f702a683e84590492189844c4a39f9529c/www/src/theme/DocVersionBanner/index.tsx
import React from 'react';

import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import { ThemeClassNames } from '@docusaurus/theme-common';
import useGlobalData from '@docusaurus/useGlobalData';
import DocVersionBanner from '@theme-original/DocVersionBanner';
import clsx from 'clsx';

type VersionLabel = '1.x' | '0.1.10';

interface Version {
  name: string;
  label: VersionLabel;
  isLast: boolean;
  path: string;
  mainDocId: string;
  docs: Doc[];
  draftIds: any[];
  sidebars: Sidebars;
}

interface Doc {
  id: string;
  path: string;
  sidebar?: string;
}

interface Sidebars {
  docs: Docs;
}

interface Docs {
  link: Link;
}

interface Link {
  path: string;
  label: string;
}

function useTypedVersion() {
  const location = useLocation();

  const globalData = useGlobalData();

  const versions: Version[] = (
    globalData['docusaurus-plugin-content-docs'] as any
  ).default.versions;

  const byLabel = {} as Record<VersionLabel, Version>;
  for (const version of versions) {
    byLabel[version.label] = version;
  }

  const currentVersion: Version =
    versions
      .filter((it) => it.path !== '/docs')
      .find((it) => location.pathname.startsWith(it.path)) ??
    versions.find((it) => it.isLast) ??
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    versions[0]!;

  return {
    currentVersion,
    byLabel,
  };
}

export default function DocVersionBannerWrapper(
  props: React.ComponentProps<typeof DocVersionBanner>,
) {
  const location = useLocation();
  const versions = useTypedVersion();

  switch (versions.currentVersion.label) {
    case '1.x': {
      if (
        location.pathname.startsWith('/docs/guide/advanced/migrating-from-v0')
      ) {
        // skip banner on migration page
        return null;
      }

      return (
        <div
          className={clsx(
            ThemeClassNames.docs.docVersionBanner,
            'alert alert--info margin-bottom--md space-y-2',
          )}
          role="alert"
        >
          <p>
            You are looking at documentation for CommandKit version{' '}
            <strong>1.x</strong> (release candidate).
          </p>
          <ul className="list-inside list-disc">
            <li>
              To go to the v0 documentation,{' '}
              <Link href="/docs/v0/guide/installation">click here</Link>.
            </li>
            <li>
              To see how to migrate from v0 to v1,{' '}
              <Link href="/docs/guide/advanced/migrating-from-v0">
                click here
              </Link>
              .
            </li>
          </ul>
        </div>
      );
    }

    case '0.1.10':
    default: {
      return <DocVersionBanner {...props} />;
    }
  }
}
