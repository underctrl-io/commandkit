import { Card, Cards } from '@/components/card';
import { Heading } from '@/components/heading';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    template: '%s | CommandKit',
    default: 'CommandKit - A Discord.js handler',
  },
};

const features = [
  {
    title: 'Beginner friendly 🚀',
    description: 'CommandKit aims to be beginner friendly.',
  },
  {
    title: 'Slash + context menu commands support ✅',
    description: 'CommandKit supports slash and context menu commands.',
  },
  {
    title: 'Multiple dev guilds, users, & roles support 🤝',
    description: 'CommandKit supports multiple dev guilds, users, and roles.',
  },
  {
    title: 'Automatic command updates 🤖',
    description: 'CommandKit automatically updates commands.',
  },
  {
    title: 'REST registration behaviour 📍',
    description: 'CommandKit has REST registration behaviour.',
  },
  {
    title: 'And much more! 🧪',
    description: 'CommandKit has much more features.',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="w-72 h-96 mx-auto text-center mt-20 mb-28 md:mb-16 flex items-center justify-center flex-col md:flex-row-reverse md:gap-2 md:text-left md:mt-12 md:w-[700px] lg:w-[850px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Image
          src="/logo.png"
          alt="CommandKit Logo"
          className="md:w-[230px] lg:w-[280px] mb-10 md:mb-0"
          width={200}
          height={200}
        />

        <div>
          <p className="text-4xl font-bold mb-5 md:text-5xl lg:text-6xl">
            Let{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffbc6f] to-[#b079fc]">
              CommandKit
            </span>{' '}
            handle it for you!
          </p>
          <p className="font-semibold lg:text-xl">
            A Discord.js handler for commands and events.
          </p>

          <div className="flex items-center justify-center gap-3 mt-10 md:justify-start text-neutral-100">
            <Link
              href="/guide/installation"
              className="font-semibold bg-[#b079fc] py-2 px-4 rounded-full"
            >
              Guide
            </Link>
            <Link
              href="/docs"
              className="font-semibold bg-blue-500 py-2 px-4 rounded-full"
            >
              Docs
            </Link>
            <Link
              href="https://github.com/underctrl-io/commandkit"
              className="font-semibold bg-[#fc7993] py-2 px-4 rounded-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-[400px] md:max-w-none mx-auto md:w-[700px] lg:w-[850px] text-fd-foreground p-5 sm:p-0 mb-20">
        <Heading as="h1" className="text-lg font-semibold mb-2">
          Features
        </Heading>
        <Cards>
          {features.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </Cards>
      </section>
    </>
  );
}
