'use client';

import type React from 'react';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export function DebugConsole() {
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<
    { type: 'input' | 'output'; content: string }[]
  >([
    { type: 'output', content: 'CommandKit Debug Console v1.0.0' },
    { type: 'output', content: "Type 'help' for a list of commands" },
  ]);

  const executeCommand = () => {
    if (!command.trim()) return;

    // Add the command to history
    setHistory((prev) => [...prev, { type: 'input', content: command }]);

    // Process the command (mock implementation)
    let output = '';
    const cmd = command.toLowerCase().trim();

    if (cmd === 'help') {
      output = `Available commands:
- help: Show this help message
- status: Show bot status
- guilds: List connected guilds
- users: Show user count
- clear: Clear the console
- ping: Check bot latency`;
    } else if (cmd === 'status') {
      output =
        'Bot Status: Online\nUptime: 7 days, 4 hours\nMemory Usage: 256MB / 512MB\nCPU Usage: 15%';
    } else if (cmd === 'guilds') {
      output =
        "Connected to 5 guilds:\n- Gaming Community (5243 members)\n- Moderator's Hub (1892 members)\n- Music Lovers (3721 members)\n- Travel Club (982 members)\n- Community Server (2341 members)";
    } else if (cmd === 'users') {
      output = 'Total Users: 14,179';
    } else if (cmd === 'clear') {
      setHistory([
        { type: 'output', content: 'CommandKit Debug Console v1.0.0' },
        { type: 'output', content: "Type 'help' for a list of commands" },
      ]);
      setCommand('');
      return;
    } else if (cmd === 'ping') {
      output = 'Pong! API Latency: 42ms';
    } else {
      output = `Unknown command: ${command}\nType 'help' for a list of commands`;
    }

    // Add the output to history
    setHistory((prev) => [...prev, { type: 'output', content: output }]);

    // Clear the input
    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand();
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <ScrollArea className="h-[450px] bg-black text-white font-mono text-sm p-4">
        {history.map((item, index) => (
          <div key={index} className="mb-2">
            {item.type === 'input' ? (
              <div>
                <span className="text-green-400">{'>'} </span>
                <span>{item.content}</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-gray-300">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center p-2 bg-muted">
        <span className="text-green-500 mr-2">{'>'}</span>
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a command..."
          className="border-0 focus-visible:ring-0 bg-transparent"
        />
        <Button variant="ghost" size="icon" onClick={executeCommand}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
