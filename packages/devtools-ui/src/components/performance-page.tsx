"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PerformanceMetricsChart } from "@/components/performance-metrics-chart"
import { CommandLatencyTable } from "@/components/command-latency-table"
import { ResourceUsageChart } from "@/components/resource-usage-chart"

export function PerformancePage() {
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance</h2>
        <p className="text-muted-foreground">Monitor your bot's performance metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Key performance metrics for your Discord bot.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="metrics">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="metrics">Command Metrics</TabsTrigger>
                <TabsTrigger value="resources">Resource Usage</TabsTrigger>
                <TabsTrigger value="latency">API Latency</TabsTrigger>
              </TabsList>
              <TabsContent value="metrics" className="h-[300px]">
                <PerformanceMetricsChart />
              </TabsContent>
              <TabsContent value="resources" className="h-[300px]">
                <ResourceUsageChart />
              </TabsContent>
              <TabsContent value="latency" className="h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-4xl font-bold gradient-text">42ms</p>
                    <p className="text-muted-foreground">Average API Latency</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Command Latency</CardTitle>
            <CardDescription>Execution time for your bot's commands.</CardDescription>
          </CardHeader>
          <CardContent>
            <CommandLatencyTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Current system status and health metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">256MB / 512MB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-1/2 rounded-full bg-primary"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-muted-foreground">15%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary">
                  <div className="h-2 w-[15%] rounded-full bg-primary"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground">7 days, 4 hours</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gateway Status</span>
                  <span className="text-sm text-green-500 font-medium">Connected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

