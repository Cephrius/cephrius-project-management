"use server"

import { createClient } from "@/lib/supbase/server";
import { redirect } from "next/navigation"; 


function parsePriceToCents(input: string) {
    // accepts "1200"  "1200.50" "$1,200.50"  " $ 1,200 "
    const cleaned = input.replace(/[^0-9.]/g, "");
    if (!cleaned) return null;
    const num = Number(cleaned);
    if (!Number.isFinite(num) || num < 0) return null;
    return Math.round(num * 100);
}

export async function createJob(projectId: string, formData: FormData) {
    const supabase = createClient();
    const { data: {user}, error: userError,} = (await supabase).auth.getUser();

    if (userError || !user) redirect("/login");


}