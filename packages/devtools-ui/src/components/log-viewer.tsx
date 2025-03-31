"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for logs
const logs = [
  {
    id: "1",
    timestamp: "2023-07-01 12:00:15",
    level: "info",
    message: "Bot started successfully",
    source: "index.js",
  },
  {
    id: "2",
    timestamp: "2023-07-01 12:00:20",
    level: "info",
    message: "Connected to Discord API",
    source: "client.js",
  },
  {
    id: "3",
    timestamp: "2023-07-01 12:01:05",
    level: "debug",
    message: "Loading command modules...",
    source: "command-handler.js",
  },
  {
    id: "4",
    timestamp: "2023-07-01 12:01:10",
    level: "debug",
    message: "Loaded 15 commands successfully",
    source: "command-handler.js",
  },
  {
    id: "5",
    timestamp: "2023-07-01 12:05:30",
    level: "warn",
    message: "Rate limit approaching for guild 123456789",
    source: "rate-limiter.js",
  },
  {
    id: "6",
    timestamp: "2023-07-01 12:10:45",
    level: "error",
    message: "Failed to execute command: !play. Error: No voice channel found",
    source: "music-commands.js",
  },
  {
    id: "7",
    timestamp: "2023-07-01 12:15:20",
    level: "info",
    message: "User 'Alice' joined voice channel 'General'",
    source: "voice-events.js",
  },
  {
    id: "8",
    timestamp: "2023-07-01 12:20:10",
    level: "debug",
    message: "Processing message: !help",
    source: "message-handler.js",
  },
  {
    id: "9",
    timestamp: "2023-07-01 12:20:12",
    level: "debug",
    message: "Executing command: help",
    source: "command-handler.js",
  },
  {
    id: "10",
    timestamp: "2023-07-01 12:25:05",
    level: "error",
    message: "Database connection failed: timeout",
    source: "database.js",
  },
]

export function LogViewer({ searchTerm, logLevel }: { searchTerm: string; logLevel: string }) {
  const [filteredLogs, setFilteredLogs] = useState(logs)

  useEffect(() => {
    let filtered = logs

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.source.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (logLevel !== "all") {
      filtered = filtered.filter((log) => log.level === logLevel)
    }

    setFilteredLogs(filtered)
  }, [searchTerm, logLevel])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-500"
      case "warn":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      case "debug":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <ScrollArea className="h-[500px] border rounded-md bg-black text-white font-mono text-sm p-4">
      {filteredLogs.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No logs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex">
              <span className="text-gray-400">[{log.timestamp}]</span>
              <span className={`mx-2 px-1 rounded text-xs ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
              <span className="text-gray-300">{log.source}:</span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
}

