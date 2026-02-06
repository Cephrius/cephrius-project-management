
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";
import { ProjectsPageClient } from "@/components/projects/projects-page";


export default async function ProjectsPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) redirect("/login");

    const { data: projects } = await supabase
        .from("projects")
        .select("id, project_address, builder_name, subdivision, created_at")
        .order("created_at", { ascending: false });

    const { data: builders } = await supabase
        .from("builders")
        .select("id, name")
        .order("name");

    const { data: subdivisions } = await supabase
        .from("subdivisions")
        .select("id, name")
        .order("name");

    return (

        <div className="space-y-6">
            <BreadcrumbSetter
                crumbs={[{ label: "Projects", href: "/projects" }]}
            />

            <ProjectsPageClient
                projects={projects ?? []}
                builders={builders ?? []}
                subdivisions={subdivisions ?? []}
            />
        </div>
    );
}
