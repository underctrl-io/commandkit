import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChevronRight,
  ChevronDown,
  FolderTree,
  Command,
  Shield,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useClient } from '@/context/client-context';

export const Route = createFileRoute('/commands')({
  component: CommandHierarchy,
});

interface CommandData {
  id: string;
  name: string;
  path: string;
  category: string | null;
  parentPath: string;
  relativePath: string;
  middlewares: string[];
  supportsAI: boolean;
  description?: string;
}

interface MiddlewareData {
  id: string;
  name: string;
  path: string;
  relativePath: string;
  parentPath: string;
  global: boolean;
}

interface CommandsData {
  commands: Record<string, CommandData>;
  middlewares: Record<string, MiddlewareData>;
}

// Component to display command details when a node is clicked
const CommandDetails = ({
  command,
  middlewares,
}: {
  command: CommandData;
  middlewares: Record<string, MiddlewareData>;
}) => {
  return (
    <Card className="p-4 mt-4 bg-muted/50 border-l-4 border-l-primary rounded-sm">
      <h3 className="text-lg font-bold mb-2">
        {command.name}
        {command.supportsAI && (
          <Badge variant="outline" className="ml-2">
            ✨
          </Badge>
        )}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">ID:</p>
          <p className="font-mono text-xs break-all">{command.id}</p>
        </div>
        {command.description && (
          <div>
            <p className="text-muted-foreground">Description:</p>
            <p className="italic">{command.description}</p>
          </div>
        )}
        <div>
          <p className="text-muted-foreground">Category:</p>
          <p>{command.category || 'Uncategorized'}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground">Path:</p>
          <p className="font-mono text-xs break-all">{command.path}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground">Relative Path:</p>
          <p className="font-mono text-xs">{command.relativePath}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-muted-foreground">Middlewares:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {command.middlewares.map((middlewareId) => {
              const middleware = middlewares[middlewareId];
              return (
                <Badge
                  key={middlewareId}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  {middleware?.name || middlewareId}
                  {middleware?.global && (
                    <span className="text-xs ml-1 text-muted-foreground">
                      (global)
                    </span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

// TreeNode component for rendering each node in the hierarchy
const TreeNode = ({
  name,
  children,
  isCommand = false,
  hasMiddleware = false,
  onClick,
  isSelected,
  supportsAI,
}: {
  name: string;
  children?: React.ReactNode;
  isCommand?: boolean;
  hasMiddleware?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  supportsAI?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = Boolean(children);

  return (
    <div className="ml-4">
      <div
        className={`flex items-center py-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-800/50 rounded ${
          isSelected ? 'bg-slate-100 dark:bg-gray-800/50' : ''
        }`}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
          if (onClick) {
            onClick();
          }
        }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1 text-muted-foreground" />
          )
        ) : (
          <span className="w-5" />
        )}

        {isCommand ? (
          <Command className="h-4 w-4 mr-1 text-primary" />
        ) : (
          <FolderTree className="h-4 w-4 mr-1 text-amber-500" />
        )}

        <span
          className={`${isCommand ? 'font-mono text-sm' : 'font-semibold'}`}
        >
          {name}
        </span>

        {hasMiddleware && (
          <Badge variant="outline" className="ml-2 py-0 h-5">
            <Shield className="h-3 w-3 mr-1" />λ
          </Badge>
        )}
        {supportsAI && (
          <Badge variant="outline" className="ml-2 py-0 h-5">
            ✨
          </Badge>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="border-l border-dashed border-slate-300 dark:border-slate-700 pl-2">
          {children}
        </div>
      )}
    </div>
  );
};

function CommandHierarchy() {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const client = useClient<true>();
  const {
    data,
    isError: error,
    isLoading: loading,
  } = useQuery({
    queryKey: ['commands'],
    enabled: Boolean(client),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async () => {
      const res = await client.api.get<CommandsData>('/commands');
      return res.data;
    },
  });

  // Group commands by category
  const groupedCommands = data
    ? Object.values(data.commands).reduce(
        (acc, command) => {
          const category = command.category || 'uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(command);
          return acc;
        },
        {} as Record<string, CommandData[]>,
      )
    : ({} as Record<string, CommandData[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading command data...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return <div>No command data available</div>;
  }

  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-6">Commands</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border rounded-lg p-4 bg-muted/50 shadow-sm overflow-auto max-h-[80vh]">
          <h2 className="text-xl font-bold mb-4">Commands</h2>

          <div className="command-tree">
            {(Object.entries(groupedCommands) as [string, CommandData[]][]).map(
              ([category, commands]) => (
                <TreeNode key={category} name={category}>
                  {commands.map((command) => (
                    <TreeNode
                      key={command.id}
                      name={command.name}
                      isCommand={true}
                      supportsAI={command.supportsAI}
                      hasMiddleware={command.middlewares.length > 0}
                      onClick={() => setSelectedCommand(command.id)}
                      isSelected={selectedCommand === command.id}
                    />
                  ))}
                </TreeNode>
              ),
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg p-4 bg-muted/50 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Command Details</h2>

          {selectedCommand ? (
            <CommandDetails
              command={data.commands[selectedCommand]}
              middlewares={data.middlewares}
            />
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a command to view its details</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-muted-foreground">
        <p>
          <Badge variant="outline" className="mr-2">
            <Shield className="h-3 w-3 mr-1" />λ
          </Badge>
          indicates the command has middleware associated
        </p>
      </div>
    </div>
  );
}
