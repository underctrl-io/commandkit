import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for errors
const errors = [
  {
    id: "1",
    timestamp: "2023-07-01 12:10:45",
    message: "Failed to execute command: !play",
    stack: `Error: No voice channel found
    at VoiceManager.joinChannel (/app/src/managers/voice-manager.js:45:11)
    at MusicCommand.execute (/app/src/commands/music/play.js:28:23)
    at CommandHandler.executeCommand (/app/src/handlers/command-handler.js:132:18)
    at MessageCreate.handleMessage (/app/src/events/message-create.js:67:22)`,
    count: 3,
    lastOccurrence: "2023-07-01 12:45:12",
    resolved: false,
  },
  {
    id: "2",
    timestamp: "2023-07-01 12:25:05",
    message: "Database connection failed: timeout",
    stack: `Error: Connection timeout
    at Database.connect (/app/src/database/index.js:78:15)
    at async Bot.initialize (/app/src/bot.js:45:5)`,
    count: 5,
    lastOccurrence: "2023-07-01 13:15:30",
    resolved: false,
  },
  {
    id: "3",
    timestamp: "2023-07-01 13:05:22",
    message: "Failed to fetch user data: 404 Not Found",
    stack: `Error: Request failed with status code 404
    at UserAPI.fetchUser (/app/src/api/user-api.js:32:11)
    at UserCommand.execute (/app/src/commands/user/info.js:24:29)
    at CommandHandler.executeCommand (/app/src/handlers/command-handler.js:132:18)
    at InteractionCreate.handleInteraction (/app/src/events/interaction-create.js:45:20)`,
    count: 2,
    lastOccurrence: "2023-07-01 13:10:15",
    resolved: true,
  },
  {
    id: "4",
    timestamp: "2023-07-01 13:30:18",
    message: "Permission denied: Cannot ban user",
    stack: `Error: Missing permissions
    at PermissionChecker.checkBanPermission (/app/src/utils/permission-checker.js:56:13)
    at ModCommand.execute (/app/src/commands/moderation/ban.js:31:27)
    at CommandHandler.executeCommand (/app/src/handlers/command-handler.js:132:18)
    at InteractionCreate.handleInteraction (/app/src/events/interaction-create.js:45:20)`,
    count: 7,
    lastOccurrence: "2023-07-01 14:05:42",
    resolved: false,
  },
]

export function ErrorList() {
  const [expandedErrors, setExpandedErrors] = useState<string[]>([])

  const toggleError = (id: string) => {
    setExpandedErrors((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-4">
        {errors.map((error) => (
          <div
            key={error.id}
            className={`border rounded-md overflow-hidden ${error.resolved ? "border-green-500" : "border-red-500"}`}
          >
            <div className="flex items-center justify-between p-4 bg-card">
              <div>
                <div className="font-medium">{error.message}</div>
                <div className="text-xs text-muted-foreground">
                  First occurred: {error.timestamp} | Occurrences: {error.count}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={error.resolved ? "default" : "destructive"}>
                  {error.resolved ? "Resolved" : "Unresolved"}
                </Badge>
                <Button variant="ghost" size="icon" onClick={() => toggleError(error.id)}>
                  {expandedErrors.includes(error.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {expandedErrors.includes(error.id) && (
              <div className="p-4 bg-muted font-mono text-xs whitespace-pre-wrap">{error.stack}</div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

