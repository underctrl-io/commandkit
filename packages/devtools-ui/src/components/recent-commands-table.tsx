import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for recent commands
const recentCommands = [
  {
    id: "1",
    command: "!help",
    user: {
      name: "Alice",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    server: "Gaming Community",
    timestamp: "2 minutes ago",
    status: "success",
  },
  {
    id: "2",
    command: "!ban @ToxicUser",
    user: {
      name: "Bob",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    server: "Moderator's Hub",
    timestamp: "5 minutes ago",
    status: "success",
  },
  {
    id: "3",
    command: "!play despacito",
    user: {
      name: "Charlie",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    server: "Music Lovers",
    timestamp: "10 minutes ago",
    status: "error",
  },
  {
    id: "4",
    command: "!weather London",
    user: {
      name: "David",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    server: "Travel Club",
    timestamp: "15 minutes ago",
    status: "success",
  },
  {
    id: "5",
    command: "!role add @Eve Admin",
    user: {
      name: "Frank",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    server: "Community Server",
    timestamp: "20 minutes ago",
    status: "success",
  },
]

export function RecentCommandsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Command</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Server</TableHead>
          <TableHead className="hidden md:table-cell">Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recentCommands.map((command) => (
          <TableRow key={command.id}>
            <TableCell className="font-mono">{command.command}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={command.user.avatar} alt={command.user.name} />
                  <AvatarFallback>{command.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{command.user.name}</span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">{command.server}</TableCell>
            <TableCell className="hidden md:table-cell">{command.timestamp}</TableCell>
            <TableCell>
              <Badge variant={command.status === "success" ? "default" : "destructive"}>{command.status}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

