import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supbase/server";
import { redirect } from "next/navigation";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";

type ProjectDashboardPageProps = {
    params: Promise<{ id: string }>;
};

export default async function ProjectDashboardPage({ params }: ProjectDashboardPageProps) {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect("/login"); 
    const { id } = await params;


    const { data: project, error } = await supabase
        .from("projects")
        .select("id, project_address, builder_name, subdivision, created_at")
        .eq("id", (await params).id)
        .single();

    if (error || !project) {
        return (
            <div className="text-sm text-muted-foreground">
                Project not found...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <BreadcrumbSetter
                crumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.project_address },
                ]}
            />

            <div>
                <h1 className="text-xl font-semibold">{project.project_address}</h1>
                <p className="text-sm text-muted-foreground">
                    Builder: {project.builder_name}
                    {project.subdivision ? ` • Subdivision: ${project.subdivision}` : ""}
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="h-28" />
                <Card className="h-28" />
                <Card className="h-28" />
            </div>
            <Card className="h-80" />
        </div>
    )
}
