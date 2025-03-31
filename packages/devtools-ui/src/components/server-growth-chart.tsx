import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  Chart,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data for server growth over time
const data = [
  { date: 'Jan 1', servers: 120, users: 5400 },
  { date: 'Jan 8', servers: 132, users: 5900 },
  { date: 'Jan 15', servers: 141, users: 6300 },
  { date: 'Jan 22', servers: 154, users: 6800 },
  { date: 'Jan 29', servers: 162, users: 7200 },
  { date: 'Feb 5', servers: 170, users: 7600 },
  { date: 'Feb 12', servers: 178, users: 8100 },
];

export function ServerGrowthChart() {
  return (
    <Chart className="h-full w-full">
      <ChartLegend>
        <ChartLegendContent />
      </ChartLegend>
      <ChartContainer config={{}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
            <YAxis yAxisId="right" orientation="right" stroke="#ff7d05" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="servers"
              stroke="hsl(var(--primary))"
              name="Servers"
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="users"
              stroke="#ff7d05"
              name="Users"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Chart>
  );
}
