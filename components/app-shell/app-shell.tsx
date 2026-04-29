// Onboarding: this wraps every authenticated product route after
// `app/(jobsyte-app)/(app)/layout.tsx` has loaded company context. Navigation
// details are split across `desktop-sidebar.tsx`, `mobile-sidebar.tsx`, and
// `header.tsx`.
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BreadcrumbProvider } from "./breadcrumb-context";
import { SidebarStateProvider } from "./sidebar-state";
import { RouteTransition } from "./route-transition";
import { MainView } from "./mainview";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <SidebarStateProvider>
        <div className="min-h-screen bg-muted/30">
          <div className="flex gap-2 p-2 sm:gap-3 sm:p-3">
            <Sidebar />
            <div className="min-w-0 flex-1 flex flex-col md:h-[calc(100vh-1.5rem)]">
              <Header />
              <MainView>
                <main data-app-shell-main className="flex min-h-0 h-full flex-1 flex-col overflow-y-auto p-3 sm:p-6 md:pb-4">
                  <RouteTransition>{children}</RouteTransition>
                </main>
              </MainView>
            </div>
          </div>
        </div>
      </SidebarStateProvider>
    </BreadcrumbProvider>
  );
}
