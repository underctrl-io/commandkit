import { DashboardLayout } from '@/components/dashboard-layout';
import { EventsPage } from '@/components/events-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/events')({
  component: Events,
});

function Events() {
  return (
    <DashboardLayout>
      <EventsPage />
    </DashboardLayout>
  );
}
