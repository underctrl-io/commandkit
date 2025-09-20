import React from 'react';
import { Terminal } from 'lucide-react';

export default function GetStartedSection(): React.JSX.Element {
  return (
    <section className="relative z-10 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Create your first CommandKit bot in minutes with our simple setup
            process
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-mono text-sm">Terminal</span>
            </div>
            <div className="font-mono text-white">
              <div className="flex gap-1">
                <span className="text-gray-400">$</span>
                <span className="text-cyan-300">
                  npm create commandkit@next
                </span>
              </div>
              <div className="text-gray-400 mt-2">
                # Follow the interactive setup
              </div>
              <div className="flex gap-1 mt-2">
                <span className="text-gray-400">$</span>
                <span className="text-cyan-300">npm run dev</span>
              </div>
              <div className="text-green-400 mt-2">
                Logged in as your_bot_name!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
