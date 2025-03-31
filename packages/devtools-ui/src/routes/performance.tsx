import { DashboardLayout } from '@/components/dashboard-layout';
import { PerformancePage } from '@/components/performance-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/performance')({
  component: Performance,
});

function Performance() {
  return (
    <DashboardLayout>
      <PerformancePage />
    </DashboardLayout>
  );
}
