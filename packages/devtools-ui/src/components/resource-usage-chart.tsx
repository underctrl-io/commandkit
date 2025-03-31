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
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data for resource usage over time
const data = [
  { time: '00:00', memory: 220, cpu: 12 },
  { time: '04:00', memory: 240, cpu: 15 },
  { time: '08:00', memory: 280, cpu: 22 },
  { time: '12:00', memory: 320, cpu: 28 },
  { time: '16:00', memory: 350, cpu: 32 },
  { time: '20:00', memory: 310, cpu: 25 },
  { time: '24:00', memory: 290, cpu: 20 },
];

export function ResourceUsageChart() {
  return (
    <Chart className="h-full w-full">
      <ChartLegend>
        <ChartLegendContent />
      </ChartLegend>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="memory"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorMemory)"
              name="Memory (MB)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cpu"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorCpu)"
              name="CPU (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Chart>
  );
}
