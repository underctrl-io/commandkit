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

// Mock data for command usage over time
const data = [
  { date: 'Jan 1', help: 65, ping: 28, ban: 15, play: 42 },
  { date: 'Jan 2', help: 59, ping: 32, ban: 18, play: 48 },
  { date: 'Jan 3', help: 80, ping: 41, ban: 22, play: 55 },
  { date: 'Jan 4', help: 81, ping: 37, ban: 25, play: 58 },
  { date: 'Jan 5', help: 56, ping: 33, ban: 12, play: 49 },
  { date: 'Jan 6', help: 55, ping: 30, ban: 10, play: 52 },
  { date: 'Jan 7', help: 72, ping: 39, ban: 20, play: 61 },
];

export function CommandUsageChart() {
  return (
    <Chart className="h-full w-full">
      <ChartLegend>
        <ChartLegendContent />
      </ChartLegend>
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorHelp" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5252" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ff5252" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPlay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="help"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorHelp)"
              name="!help"
            />
            <Area
              type="monotone"
              dataKey="ping"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorPing)"
              name="!ping"
            />
            <Area
              type="monotone"
              dataKey="ban"
              stroke="#ff5252"
              fillOpacity={1}
              fill="url(#colorBan)"
              name="!ban"
            />
            <Area
              type="monotone"
              dataKey="play"
              stroke="#4caf50"
              fillOpacity={1}
              fill="url(#colorPlay)"
              name="!play"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Chart>
  );
}
