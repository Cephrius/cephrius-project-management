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
          <div className="flex gap-3 p-3">
            <Sidebar />
            <div className="min-w-0 flex-1 flex flex-col h-screen">
              <div className="flex-shrink-0">
                <Header />
              </div>
              <MainView>
                <main data-app-shell-main className="flex flex-1 flex-col p-4 sm:p-6 md:pb-4">
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
