import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CommandUsageChart } from '@/components/command-usage-chart';
import { ServerGrowthChart } from '@/components/server-growth-chart';
import { PerformanceMetricsChart } from '@/components/performance-metrics-chart';
import { RecentCommandsTable } from '@/components/recent-commands-table';
import { ServerStatusList } from '@/components/server-status-list';

export function DashboardOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Dashboard Overview</CardTitle>
          <CardDescription>
            Welcome to CommandKit devtools. Here's an overview of your bot's
            performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="commands">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="commands">Command Usage</TabsTrigger>
              <TabsTrigger value="servers">Server Growth</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
            <TabsContent value="commands" className="h-[300px]">
              <CommandUsageChart />
            </TabsContent>
            <TabsContent value="servers" className="h-[300px]">
              <ServerGrowthChart />
            </TabsContent>
            <TabsContent value="performance" className="h-[300px]">
              <PerformanceMetricsChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Commands</CardTitle>
          <CardDescription>
            The most recent commands executed across all servers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentCommandsTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
          <CardDescription>Status of your top servers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServerStatusList />
        </CardContent>
      </Card>
    </div>
  );
}
