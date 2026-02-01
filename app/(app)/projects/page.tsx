
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { createClient } from "@/lib/supbase/server";
import { BreadcrumbSetter } from "@/components/app-shell/breadcrumb-setter";


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

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Projects</h1>
                    <p className="text-sm text-muted-foreground">Create projects and manage jobs.</p>
                </div>

                <NewProjectButton
                    initialBuilders={builders ?? []}
                    initialSubdivisions={subdivisions ?? []}
                />
            </div>

            {(!projects || projects.length === 0) ? (
                <Card className="p-8">
                    <div className="text-sm text-muted-foreground">
                        No projects yet. Create your first project to get started.
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((p) => (
                        <Link key={p.id} href={`/projects/${p.id}`}>
                            <Card className="p-4 hover:bg-muted/40 transition">
                                <div className="font-medium">{p.project_address}</div>
                                <div className="mt-1 text-sm text-muted-foreground">Builder: {p.builder_name}</div>
                                {p.subdivision && (
                                    <div className="text-sm text-muted-foreground">Subdivision: {p.subdivision}</div>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
