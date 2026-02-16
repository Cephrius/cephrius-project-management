import { createClient } from "@/lib/supabase/server";
import { DesktopSidebar } from "./desktop-sidebar";
import { SidebarNav } from "./sidebar-nav";

function formatCompanyName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";

  const businessTerms = [
    "llc",
    "llp",
    "co",
    "corp",
    "inc",
    "ltd",
    "plc",
    "pllc",
    "pc",
    "pa",
    "lp",
  ];

  return trimmed
    .split(" ")
    .map((word) => {
      const lowerWord = word.toLowerCase();
      if (businessTerms.includes(lowerWord.replace(/[.,]/g, ""))) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export async function Sidebar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rawCompanyName =
    (user?.user_metadata?.company_name as string) || "Your Company";
  const companyName = formatCompanyName(rawCompanyName);

  return (
    <div data-app-shell-sidebar>
      <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="rounded-2xl border border-primary/20 bg-background/95 p-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarNav mobile />
        </div>
      </div>

      <DesktopSidebar companyName={companyName} />
    </div>
  );
}
