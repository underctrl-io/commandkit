import { LucideIcon } from 'lucide-react';
import React from 'react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  borderColor,
}: FeatureCardProps): React.JSX.Element {
  return (
    <div
      className={`p-6 rounded-xl bg-gradient-to-br ${gradient} border ${borderColor} hover:shadow-xl group`}
    >
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
