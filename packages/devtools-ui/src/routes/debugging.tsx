import { DashboardLayout } from '@/components/dashboard-layout';
import { DebuggingPage } from '@/components/debugging-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/debugging')({
  component: Debugging,
});

function Debugging() {
  return (
    <DashboardLayout>
      <DebuggingPage />
    </DashboardLayout>
  );
}
