import { useState } from "react"
import { Search, RefreshCw, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogViewer } from "@/components/log-viewer"
import { ErrorList } from "@/components/error-list"
import { DebugConsole } from "@/components/debug-console"

export function DebuggingPage() {
  const [logLevel, setLogLevel] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")

  return (
    <div className="grid gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Debugging</h2>
        <p className="text-muted-foreground">Debug and troubleshoot your Discord bot.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Tools</CardTitle>
          <CardDescription>Tools to help you debug and troubleshoot your bot.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>
            <TabsContent value="logs">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Search logs..."
                  className="max-w-sm"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={logLevel}
                  onChange={(e) => setLogLevel(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              <LogViewer searchTerm={searchTerm} logLevel={logLevel} />
            </TabsContent>
            <TabsContent value="errors">
              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Search errors..."
                  className="max-w-sm"
                  prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                />
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
              <ErrorList />
            </TabsContent>
            <TabsContent value="console">
              <DebugConsole />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

