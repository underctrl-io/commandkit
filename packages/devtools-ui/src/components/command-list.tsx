"use client"

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

// Mock data for commands
const allCommands = [
  {
    id: "1",
    name: "help",
    description: "Shows a help message with available commands",
    type: "slash",
    usage: 1245,
    cooldown: "3s",
    permissions: ["SEND_MESSAGES"],
  },
  {
    id: "2",
    name: "ping",
    description: "Checks the bot's latency",
    type: "both",
    usage: 876,
    cooldown: "5s",
    permissions: ["SEND_MESSAGES"],
  },
  {
    id: "3",
    name: "ban",
    description: "Bans a user from the server",
    type: "both",
    usage: 234,
    cooldown: "0s",
    permissions: ["BAN_MEMBERS"],
  },
  {
    id: "4",
    name: "kick",
    description: "Kicks a user from the server",
    type: "both",
    usage: 189,
    cooldown: "0s",
    permissions: ["KICK_MEMBERS"],
  },
  {
    id: "5",
    name: "play",
    description: "Plays a song in the voice channel",
    type: "prefix",
    usage: 567,
    cooldown: "2s",
    permissions: ["CONNECT", "SPEAK"],
  },
  {
    id: "6",
    name: "skip",
    description: "Skips the current song",
    type: "prefix",
    usage: 432,
    cooldown: "1s",
    permissions: ["CONNECT", "SPEAK"],
  },
  {
    id: "7",
    name: "queue",
    description: "Shows the current music queue",
    type: "prefix",
    usage: 321,
    cooldown: "3s",
    permissions: ["SEND_MESSAGES"],
  },
]

export function CommandList({ type }: { type?: "slash" | "prefix" | "both" }) {
  const [selectedCommands, setSelectedCommands] = useState<string[]>([])

  const filteredCommands = type
    ? allCommands.filter((command) => command.type === type || command.type === "both")
    : allCommands

  const toggleCommand = (id: string) => {
    setSelectedCommands((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedCommands.length === filteredCommands.length) {
      setSelectedCommands([])
    } else {
      setSelectedCommands(filteredCommands.map((c) => c.id))
    }
  }

  return (
    <div>
      {selectedCommands.length > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">{selectedCommands.length} selected</span>
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
                checked={filteredCommands.length > 0 && selectedCommands.length === filteredCommands.length}
                onCheckedChange={toggleAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Description</TableHead>
            <TableHead className="hidden md:table-cell">Type</TableHead>
            <TableHead className="hidden md:table-cell">Usage</TableHead>
            <TableHead className="hidden md:table-cell">Cooldown</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCommands.map((command) => (
            <TableRow key={command.id}>
              <TableCell>
                <Checkbox
                  checked={selectedCommands.includes(command.id)}
                  onCheckedChange={() => toggleCommand(command.id)}
                  aria-label={`Select ${command.name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{command.name}</TableCell>
              <TableCell className="hidden md:table-cell">{command.description}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">
                  {command.type === "both" ? "Slash & Prefix" : command.type === "slash" ? "Slash" : "Prefix"}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">{command.usage}</TableCell>
              <TableCell className="hidden md:table-cell">{command.cooldown}</TableCell>
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
                    <DropdownMenuItem>View Usage</DropdownMenuItem>
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

