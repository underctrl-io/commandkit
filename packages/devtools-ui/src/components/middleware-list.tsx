"use client"

import { useState } from "react"
import { Edit, Trash, MoreHorizontal, ArrowUp, ArrowDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for middleware
const middleware = [
  {
    id: "1",
    name: "Rate Limiter",
    description: "Limits the number of commands a user can execute in a time period",
    active: true,
    priority: 1,
    type: "global",
  },
  {
    id: "2",
    name: "Permission Checker",
    description: "Checks if a user has the required permissions to execute a command",
    active: true,
    priority: 2,
    type: "command",
  },
  {
    id: "3",
    name: "Cooldown Manager",
    description: "Manages command cooldowns for users",
    active: true,
    priority: 3,
    type: "command",
  },
  {
    id: "4",
    name: "Blacklist Filter",
    description: "Filters out blacklisted words from messages",
    active: true,
    priority: 4,
    type: "message",
  },
  {
    id: "5",
    name: "Logger",
    description: "Logs all commands and events",
    active: true,
    priority: 5,
    type: "global",
  },
  {
    id: "6",
    name: "Analytics Tracker",
    description: "Tracks command usage and other metrics",
    active: false,
    priority: 6,
    type: "global",
  },
  {
    id: "7",
    name: "Error Handler",
    description: "Handles errors and exceptions",
    active: true,
    priority: 7,
    type: "global",
  },
]

export function MiddlewareList() {
  const [selectedMiddleware, setSelectedMiddleware] = useState<string[]>([])

  const toggleMiddleware = (id: string) => {
    setSelectedMiddleware((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedMiddleware.length === middleware.length) {
      setSelectedMiddleware([])
    } else {
      setSelectedMiddleware(middleware.map((c) => c.id))
    }
  }

  return (
    <div>
      {selectedMiddleware.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{selectedMiddleware.length} selected</span>
          <Button variant="outline" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={middleware.length > 0 && selectedMiddleware.length === middleware.length}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Priority</TableHead>
            <TableHead className="w-[120px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {middleware.map((mw) => (
            <TableRow key={mw.id}>
              <TableCell>
                <Checkbox
                  checked={selectedMiddleware.includes(mw.id)}
                  onCheckedChange={() => toggleMiddleware(mw.id)}
                  aria-label={`Select ${mw.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{mw.name}</TableCell>
              <TableCell className="hidden md:table-cell">{mw.description}</TableCell>
              <TableCell>
                <Badge variant={mw.active ? "default" : "outline"}>{mw.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{mw.type}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{mw.priority}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon">
                    <ArrowUp className="h-4 w-4" />
                    <span className="sr-only">Move up</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ArrowDown className="h-4 w-4" />
                    <span className="sr-only">Move down</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{mw.active ? "Deactivate" : "Activate"}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

