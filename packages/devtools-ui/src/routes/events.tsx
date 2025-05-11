import { AppEventsHandlerLoadedData } from '@/api/structures/events';
import Loader from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { useClient } from '@/context/client-context';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

export const Route = createFileRoute('/events')({
  component: RouteComponent,
});

function RouteComponent() {
  const client = useClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await client.events.fetch();
      return res;
    },
  });

  const defaultEventNamespace = useMemo(() => crypto.randomUUID(), []);

  const eventGroupsByNamespace = useMemo(() => {
    if (!data) return [];

    const groups: Record<string, AppEventsHandlerLoadedData[]> = {};

    data.forEach((event) => {
      const namespace = event.namespace || defaultEventNamespace;
      if (!groups[namespace]) {
        groups[namespace] = [];
      }
      groups[namespace].push(event);
    });

    return Object.entries(groups).map(([namespace, events]) => ({
      namespace,
      events,
    }));
  }, [data, defaultEventNamespace]);

  if (isLoading || !data) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="h-screen grid place-items-center">
        <h1 className="text-2xl text-red-500">
          An error occurred while fetching events data.
        </h1>
      </div>
    );
  }

  return (
    <div className="p-4">
      {eventGroupsByNamespace.map((event) => (
        <div key={event.namespace} className="mb-6">
          <h1 className="text-2xl font-bold capitalize">
            {event.namespace === defaultEventNamespace
              ? 'Default'
              : event.namespace}
          </h1>
          <div className="grid grid-cols-3 gap-4 py-4">
            {event.events.map((e) => (
              <div
                key={`${e.name}-${event.namespace}`}
                className="border p-4 rounded"
              >
                <h2 className="text-lg font-semibold">{e.name}</h2>
                <p className="text-muted-foreground text-xs mt-2 font-medium font-mono break-all">
                  {e.metadata.path}
                </p>

                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500 mt-2 font-mono"
                  >
                    Namespace: {e.namespace || 'discord.js'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500 mt-2 font-mono break-all"
                  >
                    Once: {e.onceListeners}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500 mt-2 font-mono break-all"
                  >
                    Regular: {e.regularListeners}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
