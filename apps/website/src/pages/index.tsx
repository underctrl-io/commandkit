import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

// Floating particles component
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating circles */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-32 left-20 w-20 h-20 bg-pink-500/10 rounded-full animate-pulse delay-500"></div>

      {/* SVG Particles */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated dots */}
        <circle cx="100" cy="150" r="3" fill="rgba(164, 110, 248, 0.3)">
          <animate
            attributeName="cy"
            values="150;120;150"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="100" r="2" fill="rgba(126, 51, 246, 0.4)">
          <animate
            attributeName="cx"
            values="200;230;200"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="300" cy="200" r="4" fill="rgba(176, 121, 252, 0.2)">
          <animate
            attributeName="r"
            values="4;6;4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="80%" cy="30%" r="2" fill="rgba(164, 110, 248, 0.3)">
          <animate
            attributeName="cy"
            values="30%;25%;30%"
            dur="5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="90%" cy="60%" r="3" fill="rgba(204, 138, 250, 0.4)">
          <animate
            attributeName="cx"
            values="90%;85%;90%"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>

        {/* Animated paths/lines */}
        <path
          d="M50,80 Q100,50 150,80"
          stroke="rgba(164, 110, 248, 0.2)"
          strokeWidth="1"
          fill="none"
        >
          <animate
            attributeName="d"
            values="M50,80 Q100,50 150,80;M50,80 Q100,40 150,80;M50,80 Q100,50 150,80"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M250,150 Q300,120 350,150"
          stroke="rgba(126, 51, 246, 0.15)"
          strokeWidth="1"
          fill="none"
        >
          <animate
            attributeName="d"
            values="M250,150 Q300,120 350,150;M250,150 Q300,110 350,150;M250,150 Q300,120 350,150"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>

        {/* Geometric shapes */}
        <polygon points="70,250 80,230 90,250" fill="rgba(164, 110, 248, 0.2)">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 80 240;360 80 240"
            dur="8s"
            repeatCount="indefinite"
          />
        </polygon>
        <rect
          x="75%"
          y="20%"
          width="8"
          height="8"
          fill="rgba(176, 121, 252, 0.3)"
          rx="1"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 79% 24%;45 79% 24%"
            dur="6s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    </div>
  );
}

// Background gradient component
function BackgroundGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundGradient />
        <FloatingParticles />

        <section className="relative z-10 w-72 h-96 mx-auto text-center mt-32 mb-48 lg:mb-32 md:mb-16 flex items-center justify-center flex-col md:flex-row-reverse md:gap-2 md:text-left md:mt-12 md:w-[700px] lg:w-[850px]">
          <img
            src="/img/logo.png"
            alt="CommandKit logo"
            className="md:w-[250px] lg:w-[280px] mb-10 md:mb-0 select-none drop-shadow-2xl hover:drop-shadow-[0_20px_35px_rgba(164,110,248,0.3)] transition-all duration-500"
            width={250}
            height={250}
            draggable={false}
          />

          <div className="relative">
            {/* Decorative elements around text */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-2 border-purple-400/30 rounded-full animate-spin-slow"></div>
            <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full animate-pulse"></div>

            <p className="text-4xl font-bold mb-5 md:text-5xl lg:text-6xl relative">
              Let{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffbc6f] to-[#b079fc] relative">
                CommandKit
                {/* Sparkle effect */}
                <span className="absolute -top-2 -right-2 text-yellow-400 animate-ping text-sm">
                  ✨
                </span>
              </span>{' '}
              handle it for you!
            </p>
            <p className="font-semibold lg:text-xl text-gray-600 dark:text-gray-300">
              The discord.js meta-framework for building powerful, modular, and
              extensible Discord bots with ease.
            </p>

            <div className="flex items-center justify-center gap-3 mt-10 md:justify-start [&>a]:text-white [&>a]:hover:text-white">
              <Link
                to="/docs/guide/getting-started/introduction"
                className="font-semibold bg-gradient-to-r from-[#b079fc] to-[#9a60f7] hover:from-[#9a60f7] hover:to-[#7e33f6] py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Guide
              </Link>
              <Link
                to="/docs/api-reference/commandkit"
                className="font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                API <span className="hidden md:inline">Reference</span>
              </Link>
              <Link
                href="https://github.com/underctrl-io/commandkit"
                className="font-semibold bg-gradient-to-r from-[#fc7993] to-[#f06292] hover:from-[#f06292] hover:to-[#e91e63] py-2 px-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                GitHub
              </Link>
            </div>
          </div>
        </section>

        {/* Additional decorative section */}
        <section className="relative z-10 pb-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {/* Feature cards with animated icons */}
              <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900/20 border border-purple-200/50 dark:border-purple-800/50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Fast Setup</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get your bot running in minutes with our streamlined setup
                  process and powerful CLI tools.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900/20 border border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Straightforward</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build scalable bots without writing unnecessary, boilerplate
                  code.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-gradient-to-br from-pink-50 to-white dark:from-pink-900/20 dark:to-gray-900/20 border border-pink-200/50 dark:border-pink-800/50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Developer Friendly
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intuitive API design with TypeScript support and great DX.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
