import Link from "next/link";
import { Separator } from "@/components/ui/separator";


export function Sidebar() {
    return (
        <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-background">
            <div className="p-4">
                <div className="text-sm font-semibold">Cephrius Nexus</div>
                <div className="text-xs text-muted-foreground">Contractor Portal</div>
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