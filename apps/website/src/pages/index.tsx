import Layout from '@theme/Layout';
import {
  FeaturesSection,
  GetStartedSection,
  HeroSection,
  PluginsSection,
} from '../components/home';

function BackgroundGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-400/15 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        <BackgroundGradient />

        <HeroSection />
        <FeaturesSection />
        <PluginsSection />
        <GetStartedSection />
      </div>
    </Layout>
  );
}
