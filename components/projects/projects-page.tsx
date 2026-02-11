"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Filter,
  Grid2X2,
  Hammer,
  Home,
  List,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { AddJobButton } from "@/components/jobs/add-job-button";
import { CreateInvoiceButton } from "@/components/invoices/create-invoice-button";
import { NewProjectButton } from "@/components/projects/new-project-button";
import { ProjectsList } from "@/components/projects/projects-list";
import type { LookupItem, ProjectListItem } from "@/components/projects/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DeleteProjectButton } from "./delete-project-button";

const PROJECTS_VIEW_STORAGE_KEY = "projects:view";
const UNASSIGNED_BUILDER = "__unassigned_builder__";
const UNASSIGNED_SUBDIVISION = "__unassigned_subdivision__";

type ViewMode = "list" | "grid";
type StatusFilter = "all" | ProjectListItem["status"];

function formatRelativeTime(value: string | null): string {
  if (!value) return "No activity yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";

  return formatDistanceToNow(date, { addSuffix: true });
}

function statusLabel(status: ProjectListItem["status"]): string {
  if (status === "not-started") return "Not Started";
  if (status === "completed") return "Completed";
  return "Active";
}

function toInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

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
  const [crewFilter, setCrewFilter] = useState("all");
  const [builderFilter, setBuilderFilter] = useState("all");
  const [subdivisionFilter, setSubdivisionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window === "undefined") return "list";
    const savedView = window.localStorage.getItem(PROJECTS_VIEW_STORAGE_KEY);
    if (savedView === "list" || savedView === "grid") return savedView;
    if (savedView === "cards") return "grid";
    if (savedView === "table") return "list";
    return "list";
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projects[0]?.id ?? null,
  );

  useEffect(() => {
    localStorage.setItem(PROJECTS_VIEW_STORAGE_KEY, view);
  }, [view]);

  const crewOptions = useMemo(() => {
    const set = new Set<string>();
    for (const project of projects) {
      for (const name of project.crew_names) {
        set.add(name);
      }
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();

    return projects
      .filter((project) => {
        const normalizedBuilder = project.builder_name ?? UNASSIGNED_BUILDER;
        const normalizedSubdivision =
          project.subdivision ?? UNASSIGNED_SUBDIVISION;

        const matchesCrew =
          crewFilter === "all" || project.crew_names.includes(crewFilter);
        const matchesBuilder =
          builderFilter === "all" || builderFilter === normalizedBuilder;
        const matchesSubdivision =
          subdivisionFilter === "all" ||
          subdivisionFilter === normalizedSubdivision;
        const matchesStatus =
          statusFilter === "all" || statusFilter === project.status;
        const matchesQuery =
          q.length === 0 ||
          project.project_address.toLowerCase().includes(q) ||
          (project.builder_name ?? "").toLowerCase().includes(q) ||
          (project.subdivision ?? "").toLowerCase().includes(q) ||
          project.crew_names.some((name) => name.toLowerCase().includes(q));

        return (
          matchesCrew &&
          matchesBuilder &&
          matchesSubdivision &&
          matchesStatus &&
          matchesQuery
        );
      })
      .sort((a, b) => {
        const aActivity = a.last_activity_at ?? a.created_at ?? "";
        const bActivity = b.last_activity_at ?? b.created_at ?? "";
        return bActivity.localeCompare(aActivity);
      });
  }, [
    projects,
    query,
    crewFilter,
    builderFilter,
    subdivisionFilter,
    statusFilter,
  ]);

  const effectiveSelectedProjectId = useMemo(() => {
    if (filteredProjects.length === 0) return null;
    if (!selectedProjectId) return filteredProjects[0].id;

    const exists = filteredProjects.some(
      (project) => project.id === selectedProjectId,
    );
    return exists ? selectedProjectId : filteredProjects[0].id;
  }, [filteredProjects, selectedProjectId]);

  const selectedProject = useMemo(() => {
    if (!effectiveSelectedProjectId) return null;
    return (
      filteredProjects.find(
        (project) => project.id === effectiveSelectedProjectId,
      ) ?? null
    );
  }, [filteredProjects, effectiveSelectedProjectId]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    crewFilter !== "all" ||
    builderFilter !== "all" ||
    subdivisionFilter !== "all" ||
    statusFilter !== "all";

  function resetFilters() {
    setQuery("");
    setCrewFilter("all");
    setBuilderFilter("all");
    setSubdivisionFilter("all");
    setStatusFilter("all");
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">Projects (0)</h1>
          <NewProjectButton
            initialBuilders={builders}
            initialSubdivisions={subdivisions}
          />
        </div>
        <Card className="p-8">
          <div className="text-sm text-muted-foreground">
            No projects yet. Create your first project to get started.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} Project
              {filteredProjects.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:text-white">
                <Filter className="size-3" />
                Filters Active
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  <Filter className="size-4" />
                  Clear Filters
                </Button>
              </div>
            )}

            <div className="inline-flex overflow-hidden rounded-md border bg-background">
              {/* <Button
                type="button"
                variant={view === "list" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none border-0"
                onClick={() => setView("list")}
              >
                <List className="size-4" />
              </Button> */}
              {/* <Button
                type="button"
                variant={view === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-none border-0 border-l"
                onClick={() => setView("grid")}
              >
                <Grid2X2 className="size-4" />
              </Button> */}
            </div>

            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects..."
              className="w-full sm:w-72"
            />

            <NewProjectButton
              initialBuilders={builders}
              initialSubdivisions={subdivisions}
            />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <Select value={crewFilter} onValueChange={setCrewFilter}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="All Crew" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Superintendents / GC </SelectItem>
              {crewOptions.map((crewName) => (
                <SelectItem key={crewName} value={crewName}>
                  {crewName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={builderFilter} onValueChange={setBuilderFilter}>
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="All Builders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Builders</SelectItem>
              {builders.map((builder) => (
                <SelectItem key={builder.id} value={builder.name}>
                  {builder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={subdivisionFilter}
            onValueChange={setSubdivisionFilter}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="All Subdivisions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subdivisions</SelectItem>
              {subdivisions.map((subdivision) => (
                <SelectItem key={subdivision.id} value={subdivision.name}>
                  {subdivision.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full justify-between">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <Card className="p-8">
              <div className="text-sm text-muted-foreground">
                No projects match the current filters.
              </div>
            </Card>
          ) : view === "grid" ? (
            <ProjectsList projects={filteredProjects} />
          ) : (
            filteredProjects.map((project) => {
              const isSelected = effectiveSelectedProjectId === project.id;

              return (
                <Card
                  key={project.id}
                  className={cn(
                    "p-4 transition-colors sm:p-5",
                    isSelected ? "ring-2 ring-primary/20" : "hover:bg-muted/30",
                  )}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          {project.job_count}{" "}
                          {project.job_count === 1 ? " Job" : " Jobs"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-xl font-semibold leading-tight">
                              {project.project_address}
                            </div>
                            {project.status === "completed" ? (
                              <Badge
                                variant="outline"
                                className="border-green-300 bg-green-100 text-green-800"
                              >
                                Completed
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-blue-300 bg-blue-100 text-blue-800"
                              >
                                {statusLabel(project.status)}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Hammer className="size-4" />
                              Builder: {project.builder_name ?? "Unassigned"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Home className="size-4" />
                              Subdivision: {project.subdivision ?? "Unassigned"}
                            </div>
                            <div>
                              Last activity:{" "}
                              {formatRelativeTime(project.last_activity_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div onClick={(event) => event.stopPropagation()}>
                          <AddJobButton
                            projectId={project.id}
                            label=" New Job"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          />
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}`}>
                            View Jobs
                          </Link>
                        </Button>
                        <div onClick={(event) => event.stopPropagation()}>
                          <CreateInvoiceButton
                            projectId={project.id}
                            label=" New Invoice"
                            variant="outline"
                            size="sm"
                          />
                        </div>
                        <div onClick={(event) => event.stopPropagation()}>
                          <DeleteProjectButton projectId={project.id} />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-lg font-medium text-primary dark:text-white dark:hover:text-muted-foreground/90 transition delay-100"
                      >
                        Open Project
                        <ArrowRight className="size-5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <Card className="hidden xl:block h-fit p-5 xl:sticky xl:top-4">
          {selectedProject ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Selected Project
                </div>
                <div className="mt-2 text-3xl font-semibold leading-tight">
                  {selectedProject.project_address}
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-4xl font-semibold leading-none">
                      {selectedProject.job_count}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedProject.open_job_count} open
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last activity
                    </div>
                    <div className="mt-1 text-2xl font-semibold leading-tight">
                      {formatRelativeTime(selectedProject.last_activity_at)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Crew
                </div>
                {selectedProject.crew_names.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No superintendent assigned.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedProject.crew_names.slice(0, 5).map((crewName) => (
                      <div key={crewName} className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {toInitials(crewName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-base font-medium">
                          {crewName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4" />
                  Builder: {selectedProject.builder_name ?? "Unassigned"}
                </div>
                <div className="flex items-center gap-2">
                  <Home className="size-4" />
                  Subdivision: {selectedProject.subdivision ?? "Unassigned"}
                </div>
                <div className="flex items-center gap-2">
                  <UserRound className="size-4" />
                  Status:
                  {selectedProject.status === "completed" ? (
                    <Badge
                      variant="outline"
                      className="border-green-300 bg-green-100 text-green-800"
                    >
                      Completed
                    </Badge>
                  ) : (
                    <span>
                      {" "}
                      <Badge
                        variant="outline"
                        className="border-blue-300 bg-blue-100 text-blue-800"
                      >
                        {statusLabel(selectedProject.status)}
                      </Badge>
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Link
                  href={`/projects/${selectedProject.id}`}
                  className="inline-flex items-center gap-1 text-muted-foreground text-lg font-medium  hover:text-primary dark:text-white dark:hover:text-muted-foreground/90 transition delay-100"
                >
                  View Project
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a project to view details.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
