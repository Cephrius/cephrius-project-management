"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectsList } from "@/components/projects/projects-list";
import { Card } from "@/components/ui/card";

type ProjectRow = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
};

type Item = { id: string; name: string };

export function ProjectsPageClient({
  projects,
  builders,
  subdivisions,
}: {
  projects: ProjectRow[];
  builders: Item[];
  subdivisions: Item[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;

    return projects.filter((p) => {
      return (
        p.project_address.toLowerCase().includes(q) ||
        (p.builder_name ?? "").toLowerCase().includes(q) ||
        (p.subdivision ?? "").toLowerCase().includes(q)
      );
    });
  }, [projects, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Create projects and manage jobs.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full sm:w-64"
          />
          <NewProjectButton
            initialBuilders={builders}
            initialSubdivisions={subdivisions}
          />
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
            No projects yet. Create your first project to get started.
          </div>
        </Card>
      ) : (
        <ProjectsList projects={filtered} />
      )}
    </div>
  );
}
