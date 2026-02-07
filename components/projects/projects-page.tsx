"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectsList } from "@/components/projects/projects-list";
import { ProjectsTable } from "@/components/projects/projects-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LookupItem, ProjectListItem } from "@/components/projects/types";

const PROJECTS_VIEW_STORAGE_KEY = "projects:view";

export function ProjectsPageClient({
  projects,
  builders,
  subdivisions,
}: {
  projects: ProjectListItem[];
  builders: LookupItem[];
  subdivisions: LookupItem[];
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"cards" | "table">(() => {
    if (typeof window === "undefined") return "cards";
    const savedView = window.localStorage.getItem(PROJECTS_VIEW_STORAGE_KEY);
    return savedView === "cards" || savedView === "table" ? savedView : "cards";
  });

  useEffect(() => {
    localStorage.setItem(PROJECTS_VIEW_STORAGE_KEY, view);
  }, [view]);

  const filteredProjects = useMemo(() => {
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
  const resultLabel = `${filteredProjects.length} project${filteredProjects.length === 1 ? "" : "s"}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Create projects and manage jobs.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={view === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("cards")}
            >
              Card View
            </Button>
            <Button
              type="button"
              variant={view === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("table")}
            >
              Table View
            </Button>
          </div>
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
      <div className="text-sm text-muted-foreground">{resultLabel}</div>

      {projects.length === 0 ? (
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
            No projects yet. Create your first project to get started.
          </div>
        </Card>
      ) : (
        <>
          {view === "cards" ? (
            <ProjectsList projects={filteredProjects} />
          ) : (
            <ProjectsTable projects={filteredProjects} />
          )}
        </>
      )}
    </div>
  );
}
