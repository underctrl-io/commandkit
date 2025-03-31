import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerGrowthChart } from "@/components/server-growth-chart"
import { ServerList } from "@/components/server-list"
import { ServerMap } from "@/components/server-map"

export function ServersPage() {
  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Servers</h2>
        <p className="text-muted-foreground">Manage and monitor the servers your bot is in.</p>
      </div>

      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Server Growth</CardTitle>
          <CardDescription>Track the growth of servers and users over time.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ServerGrowthChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server List</CardTitle>
          <CardDescription>View and manage the servers your bot is in.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Search servers..."
              className="max-w-sm"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
            <Button variant="outline">Filter</Button>
          </div>

          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="map">Map View</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <ServerList />
            </TabsContent>
            <TabsContent value="map">
              <ServerMap />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

