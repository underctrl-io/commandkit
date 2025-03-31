'use client';

import { useState } from 'react';
import { MoreHorizontal, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data for servers
const servers = [
  {
    id: '1',
    name: 'Gaming Community',
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 5243,
    region: 'US West',
    commandsToday: 342,
    joinedAt: '2023-01-15',
  },
  {
    id: '2',
    name: "Moderator's Hub",
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 1892,
    region: 'Europe',
    commandsToday: 156,
    joinedAt: '2023-02-20',
  },
  {
    id: '3',
    name: 'Music Lovers',
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 3721,
    region: 'US East',
    commandsToday: 278,
    joinedAt: '2023-03-10',
  },
  {
    id: '4',
    name: 'Travel Club',
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 982,
    region: 'Asia',
    commandsToday: 89,
    joinedAt: '2023-04-05',
  },
  {
    id: '5',
    name: 'Community Server',
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 2341,
    region: 'Europe',
    commandsToday: 189,
    joinedAt: '2023-05-12',
  },
  {
    id: '6',
    name: "Developer's Den",
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 1567,
    region: 'US East',
    commandsToday: 201,
    joinedAt: '2023-06-18',
  },
  {
    id: '7',
    name: 'Art Gallery',
    avatar: '/placeholder.svg?height=40&width=40',
    memberCount: 876,
    region: 'Asia',
    commandsToday: 67,
    joinedAt: '2023-07-22',
  },
];

export function ServerList() {
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Server</TableHead>
          <TableHead className="hidden md:table-cell">Members</TableHead>
          <TableHead className="hidden md:table-cell">Region</TableHead>
          <TableHead className="hidden md:table-cell">Commands Today</TableHead>
          <TableHead className="hidden md:table-cell">Joined</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {servers.map((server) => (
          <TableRow key={server.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={server.avatar} alt={server.name} />
                  <AvatarFallback>{server.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{server.name}</span>
              </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {server.memberCount}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {server.region}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {server.commandsToday}
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {server.joinedAt}
            </TableCell>
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
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Commands</DropdownMenuItem>
                  <DropdownMenuItem>View Members</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
