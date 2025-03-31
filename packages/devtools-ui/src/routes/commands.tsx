import { CommandsPage } from '@/components/commands-page';
import { DashboardLayout } from '@/components/dashboard-layout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/commands')({
  component: Commands,
});

function Commands() {
  return (
    <DashboardLayout>
      <CommandsPage />
    </DashboardLayout>
  );
}
