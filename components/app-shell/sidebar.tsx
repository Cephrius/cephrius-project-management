import { DesktopSidebar } from "./desktop-sidebar";
import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <div data-app-shell-sidebar>
      <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="rounded-2xl border border-primary/20 bg-sidebar/40 p-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-sidebar/40">
          <SidebarNav mobile />
        </div>
      </div>

      <DesktopSidebar />
    </div>
  );
}
