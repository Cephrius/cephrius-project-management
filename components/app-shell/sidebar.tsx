import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "./sidebar-nav";

function formatCompanyName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) return "";

    const businessTerms = ["llc", "llp", "co", "corp", "inc", "ltd", "plc", "pllc", "pc", "pa", "lp"];

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

    const rawCompanyName = (user?.user_metadata?.company_name as string) || "Your Company";
    const companyName = formatCompanyName(rawCompanyName);

    return (
        <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col border-r bg-background">
            <div className="p-4">
                <div className="text-sm font-semibold">{companyName}</div>
                <div className="text-xs text-muted-foreground">JobSyte Portal</div>
            </div>

            <Separator />

            <SidebarNav />

            <div className="mt-auto p-3 text-xs text-muted-foreground">
                v0.1.0 - Built by <a href="https://cephrius.com" className="underline">Cephrius Technologies</a>
            </div>
        </aside>
    )
}
