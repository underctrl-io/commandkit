import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CommandUsageChart } from "@/components/command-usage-chart"
import { CommandList } from "@/components/command-list"
import { CommandForm } from "@/components/command-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function CommandsPage() {
  const [showCommandForm, setShowCommandForm] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Commands</h2>
          <p className="text-muted-foreground">Manage and monitor your bot's commands.</p>
        </div>
        <Button onClick={() => setShowCommandForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Command
        </Button>
      </div>

      {showCommandForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Command</CardTitle>
            <CardDescription>Define a new command for your Discord bot.</CardDescription>
          </CardHeader>
          <CardContent>
            <CommandForm onCancel={() => setShowCommandForm(false)} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Command Usage Analytics</CardTitle>
              <CardDescription>Track the usage of your commands over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <CommandUsageChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Command List</CardTitle>
                <CardDescription>Manage and edit your bot's commands.</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export Commands</DropdownMenuItem>
                  <DropdownMenuItem>Import Commands</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Search commands..."
                  className="max-w-sm"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Commands</TabsTrigger>
                  <TabsTrigger value="slash">Slash Commands</TabsTrigger>
                  <TabsTrigger value="prefix">Prefix Commands</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <CommandList />
                </TabsContent>
                <TabsContent value="slash">
                  <CommandList type="slash" />
                </TabsContent>
                <TabsContent value="prefix">
                  <CommandList type="prefix" />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

