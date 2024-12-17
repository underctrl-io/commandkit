import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

export default function Home(): React.JSX.Element {
  return (
    <Layout>
      <section className="w-72 h-96 mx-auto text-center mt-32 mb-28 md:mb-16 flex items-center justify-center flex-col md:flex-row-reverse md:gap-2 md:text-left md:mt-12 md:w-[700px] lg:w-[850px]">
        <img
          src="/img/logo.png"
          alt="CommandKit logo"
          className="md:w-[230px] lg:w-[280px] mb-10 md:mb-0"
          width={250}
          height={250}
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

          <div className="flex items-center justify-center gap-3 mt-10 md:justify-start [&>a]:text-white [&>a]:hover:text-white">
            <Link
              to="/docs/guide/installation"
              className="font-semibold bg-[#b079fc] py-2 px-4 rounded-full"
            >
              Guide
            </Link>
            <Link
              to="/docs/api-reference/classes/ButtonKit"
              className="font-semibold bg-blue-500 py-2 px-4 rounded-full"
            >
              API Reference
            </Link>
            <Link
              href="https://github.com/underctrl-io/commandkit"
              className="font-semibold bg-[#fc7993] py-2 px-4 rounded-full"
            >
              GitHub
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
