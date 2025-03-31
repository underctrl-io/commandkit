'use client';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  Chart,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data for performance metrics
const data = [
  { name: 'Command Latency', value: 120, fill: 'hsl(var(--primary))' },
  { name: 'API Response', value: 230, fill: '#8884d8' },
  { name: 'Database Query', value: 180, fill: '#82ca9d' },
  { name: 'Message Processing', value: 89, fill: '#ffc658' },
  { name: 'Event Handling', value: 140, fill: '#ff8042' },
];

export function PerformanceMetricsChart() {
  return (
    <Chart className="h-full w-full">
      <ChartLegend>
        <ChartLegendContent />
      </ChartLegend>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" name="Time (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Chart>
  );
}
