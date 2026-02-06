import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { BreadcrumbProvider } from "./breadcrumb-context";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <div className="min-h-screen bg-muted/30">
        <div className="flex">
          <Sidebar />
          <div className="min-w-0 flex-1">
            <Header />
            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
