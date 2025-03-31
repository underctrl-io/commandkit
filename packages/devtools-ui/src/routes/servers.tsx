import { DashboardLayout } from '@/components/dashboard-layout';
import { ServersPage } from '@/components/servers-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/servers')({
  component: Servers,
});

function Servers() {
  return (
    <DashboardLayout>
      <ServersPage />
    </DashboardLayout>
  );
}
