import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
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
    <>
      <div className="fixed inset-x-3 bottom-3 z-50 md:hidden">
        <div className="rounded-2xl border border-primary/20 bg-background/95 p-2 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarNav mobile />
        </div>
      </div>

      <aside className="hidden overflow-hidden rounded-2xl border border-primary/20 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:sticky md:top-3 md:flex md:h-[calc(100vh-1.5rem)] md:w-64 md:shrink-0 md:flex-col md:self-start">
        <div className="p-4">
          <div className="text-sm font-semibold text-primary">{companyName}</div>
          <div className="text-xs text-muted-foreground">JobSyte Portal</div>
        </div>

        <Separator />

        <SidebarNav />

        <div className="mt-auto border-t border-primary/10 p-2 text-xs text-muted-foreground">
          <p>v0.1.0 </p>
          Powered by{" "}
          <a href="https://cephrius.com" className="underline hover:text-primary">
            Cephrius Technologies{" "}
          </a>
          <a>©{new Date().getFullYear()}</a>
        </div>
      </aside>
    </>
  );
}
