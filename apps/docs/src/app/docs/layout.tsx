import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { Book } from 'lucide-react';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.pageTree}
      sidebar={{
        tabs: [
          {
            title: 'Documentation',
            url: '/docs',
            icon: <Book />,
            description: 'Documentation for CommandKit',
          },
        ],
      }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
