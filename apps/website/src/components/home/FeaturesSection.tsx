import { Bot, Code, Database, Globe, Terminal, Wrench } from 'lucide-react';
import React from 'react';
import FeatureCard from './FeatureCard';

const features = [
  {
    icon: Bot,
    title: 'All Command Types',
    description:
      'Slash commands, context menus, and message commands with automatic registration.',
    gradient:
      'from-green-50 to-white dark:from-green-900/20 dark:to-gray-900/20',
    borderColor: 'border-green-200/50 dark:border-green-800/50',
  },
  {
    icon: Globe,
    title: 'Internationalization',
    description:
      'Built-in i18n support with the @commandkit/i18n plugin for global audiences.',
    gradient:
      'from-indigo-50 to-white dark:from-indigo-900/20 dark:to-gray-900/20',
    borderColor: 'border-indigo-200/50 dark:border-indigo-800/50',
  },
  {
    icon: Wrench,
    title: 'Middleware System',
    description:
      'Powerful middleware system for command validation, authentication, and processing.',
    gradient:
      'from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-900/20',
    borderColor: 'border-orange-200/50 dark:border-orange-800/50',
  },
  {
    icon: Code,
    title: 'JSX Components',
    description:
      'Declare Discord interaction components and modals using familiar JSX syntax.',
    gradient: 'from-cyan-50 to-white dark:from-cyan-900/20 dark:to-gray-900/20',
    borderColor: 'border-cyan-200/50 dark:border-cyan-800/50',
  },
  {
    icon: Database,
    title: 'Built-in Caching',
    description:
      'Customizable cache system with @commandkit/cache for fast data storage and retrieval.',
    gradient: 'from-teal-50 to-white dark:from-teal-900/20 dark:to-gray-900/20',
    borderColor: 'border-teal-200/50 dark:border-teal-800/50',
  },
  {
    icon: Terminal,
    title: 'CLI Tools',
    description:
      'Comprehensive command-line interface for development, deployment, and management.',
    gradient: 'from-gray-50 to-white dark:from-gray-900/20 dark:to-gray-800/20',
    borderColor: 'border-gray-200/50 dark:border-gray-700/50',
  },
];

export default function FeaturesSection(): React.JSX.Element {
  return (
    <section className="relative z-10 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-2">
            Everything you need to build amazing Discord bots
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            CommandKit provides a comprehensive set of tools and features for
            Discord bot development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center">
          {features.map((feature, index) => (
            <div key={index}>
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
