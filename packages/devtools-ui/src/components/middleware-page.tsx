import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MiddlewareList } from "@/components/middleware-list"
import { MiddlewareForm } from "@/components/middleware-form"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function MiddlewarePage() {
  const [showMiddlewareForm, setShowMiddlewareForm] = useState(false)

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Middleware</h2>
          <p className="text-muted-foreground">Manage middleware for your Discord bot.</p>
        </div>
        <Button onClick={() => setShowMiddlewareForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Middleware
        </Button>
      </div>

      {showMiddlewareForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Create New Middleware</CardTitle>
            <CardDescription>Define a new middleware for your Discord bot.</CardDescription>
          </CardHeader>
          <CardContent>
            <MiddlewareForm onCancel={() => setShowMiddlewareForm(false)} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Middleware List</CardTitle>
              <CardDescription>Manage and edit your bot's middleware.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export Middleware</DropdownMenuItem>
                <DropdownMenuItem>Import Middleware</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Search middleware..."
                className="max-w-sm"
                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>

            <MiddlewareList />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

