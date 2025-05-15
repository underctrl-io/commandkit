import Loader from '@/components/loader';
import { Badge } from '@/components/ui/badge';
import { useClient } from '@/context/client-context';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/feature-flags')({
  component: RouteComponent,
});

function RouteComponent() {
  const client = useClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const res = await client.getFeatureFlags();
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
      <div>
        <h1 className="text-2xl font-bold ">Feature Flags</h1>
        <p className="text-muted-foreground">
          The below is a list of active feature flags in your project
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4 py-4">
        {data.flags.map((flag) => (
          <div key={flag.key} className="border p-4 rounded">
            <h2 className="text-lg font-semibold">{flag.key}</h2>
            <p className="text-muted-foreground text-xs mt-2 font-medium">
              {flag.description || `${flag.key} feature flag`}
            </p>
            {flag.hasIdentify && (
              <Badge
                variant="outline"
                className="text-sm text-gray-500 mt-2 font-mono"
              >
                identify
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
