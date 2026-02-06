import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";

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
        <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-background">
            <div className="p-4">
                <div className="text-sm font-semibold">{companyName}</div>
                <div className="text-xs text-muted-foreground">JobSyte Portal</div>
            </div>

            <Separator />


            <nav className="p-3 text-sm space-y-1">
                <Link className="block rounded-md px-3 py-2 hover:bg-muted" href="/">
                    Dashboard
                </Link>
                <Link className="block rounded-md px-3 py-2 hover:bg-muted" href="/projects">
                    Projects
                </Link>
                <Link className="block rounded-md px-3 py-2 hover:bg-muted" href="/invoices">
                    Invoices
                </Link>
                <Link className="block rounded-md px-3 py-2 hover:bg-muted" href="/settings">
                    Settings
                </Link>
            </nav>

            <div className="mt-auto p-3 text-xs text-muted-foreground">
                v0.1 MVP
            </div>
        </aside>
    )
}