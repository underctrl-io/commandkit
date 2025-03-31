import { DashboardLayout } from '@/components/dashboard-layout';
import { LocalizationPage } from '@/components/localization-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/localization')({
  component: Localization,
});

function Localization() {
  return (
    <DashboardLayout>
      <LocalizationPage />
    </DashboardLayout>
  );
}
