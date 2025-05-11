import Loader from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { useClient } from '@/context/client-context';
import { formatDate } from '@/lib/formatDate';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/plugins')({
  component: RouteComponent,
});

function RouteComponent() {
  const client = useClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const res = await client.plugins.fetch();
      return res;
    },
  });

  if (isLoading || !data) return <Loader />;

  if (isError) {
    return (
      <div className="h-screen grid place-items-center">
        <h1 className="text-2xl text-red-500">
          An error occurred while fetching plugins data.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Plugins</h1>
      <div className="grid grid-cols-3 gap-4 p-4">
        {data.map((plugin) => (
          <div key={plugin.id} className="border p-4 rounded">
            <h2 className="text-lg font-semibold">{plugin.name}</h2>
            <Badge
              variant="outline"
              className="text-sm text-gray-500 mt-2 font-mono"
            >
              {plugin.id}
            </Badge>
            <p className="text-muted-foreground text-xs mt-2 font-medium">
              Registered at {formatDate(plugin.loadedAt)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
