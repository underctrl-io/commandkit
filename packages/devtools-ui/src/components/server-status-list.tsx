"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for server status
const servers = [
  {
    id: "1",
    name: "Gaming Community",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 5243,
    status: "online",
    commandsToday: 342,
  },
  {
    id: "2",
    name: "Moderator's Hub",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 1892,
    status: "online",
    commandsToday: 156,
  },
  {
    id: "3",
    name: "Music Lovers",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 3721,
    status: "online",
    commandsToday: 278,
  },
  {
    id: "4",
    name: "Travel Club",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 982,
    status: "offline",
    commandsToday: 0,
  },
  {
    id: "5",
    name: "Community Server",
    avatar: "/placeholder.svg?height=40&width=40",
    memberCount: 2341,
    status: "online",
    commandsToday: 189,
  },
]

export function ServerStatusList() {
  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {servers.map((server) => (
          <div key={server.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={server.avatar} alt={server.name} />
                <AvatarFallback>{server.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{server.name}</div>
                <div className="text-xs text-muted-foreground">{server.memberCount} members</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge variant={server.status === "online" ? "default" : "outline"}>{server.status}</Badge>
              <div className="text-xs text-muted-foreground mt-1">{server.commandsToday} commands today</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

