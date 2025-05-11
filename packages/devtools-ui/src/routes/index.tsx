import { useClient } from '@/context/client-context';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Users, Server, MessageSquare } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const client = useClient<true>();

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold inline-flex items-center gap-2">
          CommandKit DevTools <Badge>Preview</Badge>
        </h1>
        <p className="text-muted-foreground">
          Welcome to the CommandKit DevTools.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Guilds</CardTitle>
            <Server className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.user.data.guilds}</div>
            <p className="text-xs text-muted-foreground">
              Servers where your bot is active
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="outline" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Active</span>
            </Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{client.user.data.users}</div>
            <p className="text-xs text-muted-foreground">
              Users with access to your bot
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="outline" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Growing</span>
            </Badge>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl font-medium">Channels</CardTitle>
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {client.user.data.channels}
            </div>
            <p className="text-xs text-muted-foreground">
              Channels where your bot is available
            </p>
          </CardContent>
          <CardFooter>
            <Badge variant="outline" className="gap-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>Available</span>
            </Badge>
          </CardFooter>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            These are some of the available actions
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link to="/commands">
            <Button className="cursor-pointer">View Commands</Button>
          </Link>
          <Link to="/guilds">
            <Button className="cursor-pointer">Manage Guilds</Button>
          </Link>
          <Link to="/events">
            <Button className="cursor-pointer">View Events</Button>
          </Link>
          <Link to="/plugins">
            <Button className="cursor-pointer">View Plugins</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
