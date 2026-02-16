import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BreadcrumbProvider } from "./breadcrumb-context";
import { SidebarStateProvider } from "./sidebar-state";
import { RouteTransition } from "./route-transition";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <SidebarStateProvider>
        <div className="min-h-screen bg-muted/30">
          <div className="flex gap-3 p-3">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <Header />
              <main data-app-shell-main className="p-4 pb-24 sm:p-6 sm:pb-28 md:pb-6">
                <RouteTransition>{children}</RouteTransition>
              </main>
            </div>
          </div>
        </div>
      </SidebarStateProvider>
    </BreadcrumbProvider>
  );
}
