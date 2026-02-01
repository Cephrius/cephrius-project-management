import { AppShell } from "@/components/app-shell/app-shell";
import { createClient } from "@/lib/supbase/server";
import { redirect } from "next/navigation";


export default async function AppLayout({children}: {children: React.ReactNode}) {
    const supabase = createClient();
    const {data} = await supabase.auth.getUser();

    if (!data.user) redirect("/login");

    return <AppShell>{children}</AppShell>;
    }