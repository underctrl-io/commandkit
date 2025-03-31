import { DashboardLayout } from '@/components/dashboard-layout';
import { MiddlewarePage } from '@/components/middleware-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/middleware')({
  component: Middleware,
});

function Middleware() {
  return (
    <DashboardLayout>
      <MiddlewarePage />
    </DashboardLayout>
  );
}
