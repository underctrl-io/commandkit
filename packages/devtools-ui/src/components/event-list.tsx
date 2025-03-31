import { useState } from "react"
import { Edit, Trash, MoreHorizontal } from "lucide-react"
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

// Mock data for events
const events = [
  {
    id: "1",
    name: "ready",
    description: "Emitted when the client becomes ready to start working",
    active: true,
    lastTriggered: "2 minutes ago",
    triggerCount: 1,
  },
  {
    id: "2",
    name: "messageCreate",
    description: "Emitted whenever a message is created",
    active: true,
    lastTriggered: "5 seconds ago",
    triggerCount: 1245,
  },
  {
    id: "3",
    name: "interactionCreate",
    description: "Emitted when an interaction is created",
    active: true,
    lastTriggered: "10 seconds ago",
    triggerCount: 876,
  },
  {
    id: "4",
    name: "guildMemberAdd",
    description: "Emitted whenever a user joins a guild",
    active: true,
    lastTriggered: "1 hour ago",
    triggerCount: 234,
  },
  {
    id: "5",
    name: "guildMemberRemove",
    description: "Emitted whenever a member leaves a guild",
    active: true,
    lastTriggered: "2 hours ago",
    triggerCount: 189,
  },
  {
    id: "6",
    name: "voiceStateUpdate",
    description: "Emitted whenever a user changes voice state",
    active: false,
    lastTriggered: "1 day ago",
    triggerCount: 567,
  },
  {
    id: "7",
    name: "channelCreate",
    description: "Emitted whenever a channel is created",
    active: true,
    lastTriggered: "3 days ago",
    triggerCount: 45,
  },
]

export function EventList() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedEvents.length === events.length) {
      setSelectedEvents([])
    } else {
      setSelectedEvents(events.map((c) => c.id))
    }
  }

  return (
    <div>
      {selectedEvents.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{selectedEvents.length} selected</span>
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
                checked={events.length > 0 && selectedEvents.length === events.length}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Last Triggered</TableHead>
            <TableHead className="hidden md:table-cell">Trigger Count</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => toggleEvent(event.id)}
                  aria-label={`Select ${event.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{event.name}</TableCell>
              <TableCell className="hidden md:table-cell">{event.description}</TableCell>
              <TableCell>
                <Badge variant={event.active ? "default" : "outline"}>{event.active ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{event.lastTriggered}</TableCell>
              <TableCell className="hidden md:table-cell">{event.triggerCount}</TableCell>
              <TableCell>
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
                    <DropdownMenuItem>View Logs</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

