import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard-overview';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}
