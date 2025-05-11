import { AppSidebar } from '@/components/app-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { ClientProvider } from '@/context/client-context';
import { createRootRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'CommandKit DevTools',
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <Toaster />
      <ClientProvider>
        <ProtectedRoute>
          <div className="[--header-height:calc(theme(spacing.14))]">
            <SidebarProvider className="flex flex-col">
              <SiteHeader />
              <div className="flex flex-1">
                <AppSidebar />
                <SidebarInset>
                  <Outlet />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </div>
        </ProtectedRoute>
      </ClientProvider>
    </ThemeProvider>
  );
}
