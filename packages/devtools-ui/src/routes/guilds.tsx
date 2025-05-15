import Loader from '@/components/loader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useClient } from '@/context/client-context';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/guilds')({
  component: RouteComponent,
});

function RouteComponent() {
  const client = useClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['guilds'],
    queryFn: async () => {
      const res = await client.guilds.fetch();
      return res;
    },
  });

  if (isLoading || !data) return <Loader />;

  if (isError)
    return (
      <div className="h-screen grid place-items-center">
        <h1 className="text-2xl text-red-500">
          An error occurred while fetching guilds data.
        </h1>
      </div>
    );

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <h1 className="text-2xl font-bold col-span-3">Guilds</h1>
      {data!.map((guild) => (
        <Card key={guild.id} className="border py-4 rounded">
          <CardHeader>
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={guild.iconURL!} alt={guild.name} />
              <AvatarFallback className="rounded-lg">
                {guild.nameAcronym}
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <CardTitle>{guild.name}</CardTitle>
            <CardDescription>
              {guild.description || `${guild.name} server`}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
