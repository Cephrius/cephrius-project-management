"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  FileText,
  Filter,
  Hammer,
  Home,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  UserRound,
} from "lucide-react";
import { AddJobDialog } from "@/components/jobs/add-job-dialog";
import { CreateInvoiceDialog } from "@/components/invoices/create-invoice-dialog";
import { ImportProjectJobsButton } from "@/components/projects/import-project-jobs-button";
import { NewProjectButton } from "@/components/projects/new-project-button";
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
import { EditProjectDialog } from "./edit-project-dialog";

const PROJECTS_VIEW_STORAGE_KEY = "projects:view";
const PROJECTS_SELECTED_STORAGE_KEY = "projects:selected-project-id";
const PROJECTS_EXPANDED_SUBDIVISIONS_STORAGE_KEY =
  "projects:expanded-subdivisions";
const PROJECTS_EXPANDED_BUILDERS_STORAGE_KEY = "projects:expanded-builders";
const PROJECTS_EXPANDED_STREETS_STORAGE_KEY = "projects:expanded-streets";
const UNASSIGNED_BUILDER = "__unassigned_builder__";
const UNASSIGNED_SUBDIVISION = "__unassigned_subdivision__";

type ViewMode = "list" | "grouped";
type StatusFilter = "all" | ProjectListItem["status"];

type StreetGroup = {
  key: string;
  label: string;
  projects: ProjectListItem[];
  totalJobCount: number;
  openJobCount: number;
};

type BuilderGroup = {
  key: string;
  label: string;
  streets: StreetGroup[];
  projectCount: number;
  totalJobCount: number;
  openJobCount: number;
};

type SubdivisionGroup = {
  key: string;
  label: string;
  builders: BuilderGroup[];
  projectCount: number;
  totalJobCount: number;
  openJobCount: number;
};

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

function parseStoredKeys(raw: string | null): string[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return null;
  }
}

function getStreetFolderLabel(projectAddress: string): string {
  const normalized = projectAddress.trim().replace(/\s+/g, " ");
  if (!normalized) return "Unassigned Street";

  const match = normalized.match(/^\d+\s+(.+)$/);
  if (match?.[1]) return match[1].trim();

  return normalized;
}

function ProjectCardActionsDropdown({
  project,
  builders,
  subdivisions,
  onViewProject,
}: {
  project: ProjectListItem;
  builders: LookupItem[];
  subdivisions: LookupItem[];
  onViewProject?: (projectId: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [addJobOpen, setAddJobOpen] = useState(false);
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);

  return (
    <>
      <DropdownMenu >
        <DropdownMenuTrigger asChild>
          <Button 
            type="button"
            variant="outline"
            size="sm"
            aria-label="Project actions"
            className="cursor-pointer gap-2 border-primary/30 hover:bg-primary/10"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
            <span className="hidden sm:inline">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setEditOpen(true);
            }}
          >
            <Pencil className="size-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setAddJobOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Job
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link
              href={`/projects/${project.id}`}
              className="flex w-full items-center gap-2"
              onClick={() => onViewProject?.(project.id)}
            >
              <ArrowRight className="size-4" />
              View Jobs
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"
            onSelect={(event) => {
              event.preventDefault();
              setCreateInvoiceOpen(true);
            }}
          >
            <FileText className="size-4" />
            New Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        initialBuilders={builders}
        initialSubdivisions={subdivisions}
      />
      <AddJobDialog
        projectId={project.id}
        open={addJobOpen}
        onOpenChange={setAddJobOpen}
      />
      <CreateInvoiceDialog
        projectId={project.id}
        open={createInvoiceOpen}
        onOpenChange={setCreateInvoiceOpen}
      />
    </>
  );
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
    if (savedView === "list" || savedView === "grouped") return savedView;
    if (savedView === "grid" || savedView === "cards") return "list";
    if (savedView === "table") return "list";
    return "list";
  });
  const [expandedSubdivisions, setExpandedSubdivisions] = useState<
    string[] | null
  >(() => {
    if (typeof window === "undefined") return null;
    return parseStoredKeys(
      window.localStorage.getItem(PROJECTS_EXPANDED_SUBDIVISIONS_STORAGE_KEY),
    );
  });
  const [expandedBuilders, setExpandedBuilders] = useState<string[] | null>(
    () => {
      if (typeof window === "undefined") return null;
      return parseStoredKeys(
        window.localStorage.getItem(PROJECTS_EXPANDED_BUILDERS_STORAGE_KEY),
      );
    },
  );
  const [expandedStreets, setExpandedStreets] = useState<string[] | null>(() => {
    if (typeof window === "undefined") return null;
    return parseStoredKeys(
      window.localStorage.getItem(PROJECTS_EXPANDED_STREETS_STORAGE_KEY),
    );
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    () => {
      if (typeof window === "undefined") return projects[0]?.id ?? null;
      const savedProjectId = window.sessionStorage.getItem(
        PROJECTS_SELECTED_STORAGE_KEY,
      );
      return savedProjectId || projects[0]?.id || null;
    },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedProjectId) {
      window.sessionStorage.removeItem(PROJECTS_SELECTED_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(PROJECTS_SELECTED_STORAGE_KEY, selectedProjectId);
  }, [selectedProjectId]);

  useEffect(() => {
    localStorage.setItem(PROJECTS_VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (expandedSubdivisions === null) {
      window.localStorage.removeItem(PROJECTS_EXPANDED_SUBDIVISIONS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      PROJECTS_EXPANDED_SUBDIVISIONS_STORAGE_KEY,
      JSON.stringify(expandedSubdivisions),
    );
  }, [expandedSubdivisions]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (expandedBuilders === null) {
      window.localStorage.removeItem(PROJECTS_EXPANDED_BUILDERS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      PROJECTS_EXPANDED_BUILDERS_STORAGE_KEY,
      JSON.stringify(expandedBuilders),
    );
  }, [expandedBuilders]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (expandedStreets === null) {
      window.localStorage.removeItem(PROJECTS_EXPANDED_STREETS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(
      PROJECTS_EXPANDED_STREETS_STORAGE_KEY,
      JSON.stringify(expandedStreets),
    );
  }, [expandedStreets]);

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

  const groupedProjects = useMemo<SubdivisionGroup[]>(() => {
    const subdivisionMap = new Map<
      string,
      {
        key: string;
        label: string;
        builders: Map<
          string,
          {
            key: string;
            label: string;
            streets: Map<
              string,
              {
                key: string;
                label: string;
                projects: ProjectListItem[];
              }
            >;
          }
        >;
      }
    >();

    for (const project of filteredProjects) {
      const subdivisionLabel = project.subdivision?.trim() || "Unassigned Subdivision";
      const subdivisionKey = subdivisionLabel.toLowerCase();
      const builderLabel = project.builder_name?.trim() || "Unassigned Builder";
      const builderKey = `${subdivisionKey}::${builderLabel.toLowerCase()}`;
      const streetLabel = getStreetFolderLabel(project.project_address);
      const streetKey = `${builderKey}::${streetLabel.toLowerCase()}`;

      const subdivisionGroup = subdivisionMap.get(subdivisionKey) ?? {
        key: subdivisionKey,
        label: subdivisionLabel,
        builders: new Map(),
      };

      const builderGroup = subdivisionGroup.builders.get(builderKey) ?? {
        key: builderKey,
        label: builderLabel,
        streets: new Map(),
      };

      const streetGroup = builderGroup.streets.get(streetKey) ?? {
        key: streetKey,
        label: streetLabel,
        projects: [],
      };

      streetGroup.projects.push(project);
      builderGroup.streets.set(streetKey, streetGroup);
      subdivisionGroup.builders.set(builderKey, builderGroup);
      subdivisionMap.set(subdivisionKey, subdivisionGroup);
    }

    return Array.from(subdivisionMap.values())
      .map((subdivisionGroup) => {
        const builders = Array.from(subdivisionGroup.builders.values())
          .map((builderGroup) => {
            const streets = Array.from(builderGroup.streets.values())
              .map((streetGroup) => {
                const sortedProjects = [...streetGroup.projects].sort((a, b) =>
                  a.project_address.localeCompare(b.project_address),
                );

                return {
                  key: streetGroup.key,
                  label: streetGroup.label,
                  projects: sortedProjects,
                  totalJobCount: sortedProjects.reduce(
                    (sum, project) => sum + project.job_count,
                    0,
                  ),
                  openJobCount: sortedProjects.reduce(
                    (sum, project) => sum + project.open_job_count,
                    0,
                  ),
                };
              })
              .sort((a, b) => a.label.localeCompare(b.label));

            return {
              key: builderGroup.key,
              label: builderGroup.label,
              streets,
              projectCount: streets.reduce(
                (sum, streetGroup) => sum + streetGroup.projects.length,
                0,
              ),
              totalJobCount: streets.reduce(
                (sum, streetGroup) => sum + streetGroup.totalJobCount,
                0,
              ),
              openJobCount: streets.reduce(
                (sum, streetGroup) => sum + streetGroup.openJobCount,
                0,
              ),
            };
          })
          .sort((a, b) => a.label.localeCompare(b.label));

        return {
          key: subdivisionGroup.key,
          label: subdivisionGroup.label,
          builders,
          projectCount: builders.reduce(
            (sum, builderGroup) => sum + builderGroup.projectCount,
            0,
          ),
          totalJobCount: builders.reduce(
            (sum, builderGroup) => sum + builderGroup.totalJobCount,
            0,
          ),
          openJobCount: builders.reduce(
            (sum, builderGroup) => sum + builderGroup.openJobCount,
            0,
          ),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredProjects]);

  const effectiveExpandedSubdivisions = useMemo(() => {
    const subdivisionKeys = new Set(groupedProjects.map((group) => group.key));
    const defaultExpanded = groupedProjects[0] ? [groupedProjects[0].key] : [];
    const currentExpanded = expandedSubdivisions ?? defaultExpanded;

    return currentExpanded.filter((key) => subdivisionKeys.has(key));
  }, [expandedSubdivisions, groupedProjects]);

  const effectiveExpandedBuilders = useMemo(() => {
    const builderKeys = new Set(
      groupedProjects.flatMap((group) =>
        group.builders.map((builderGroup) => builderGroup.key),
      ),
    );
    const defaultExpanded = groupedProjects[0]?.builders[0]
      ? [groupedProjects[0].builders[0].key]
      : [];
    const currentExpanded = expandedBuilders ?? defaultExpanded;

    return currentExpanded.filter((key) => builderKeys.has(key));
  }, [expandedBuilders, groupedProjects]);

  const effectiveExpandedStreets = useMemo(() => {
    const streetKeys = new Set(
      groupedProjects.flatMap((group) =>
        group.builders.flatMap((builderGroup) =>
          builderGroup.streets.map((streetGroup) => streetGroup.key),
        ),
      ),
    );
    const defaultExpanded = groupedProjects[0]?.builders[0]?.streets[0]
      ? [groupedProjects[0].builders[0].streets[0].key]
      : [];
    const currentExpanded = expandedStreets ?? defaultExpanded;

    return currentExpanded.filter((key) => streetKeys.has(key));
  }, [expandedStreets, groupedProjects]);

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

  function toggleSubdivision(subdivisionKey: string) {
    setExpandedSubdivisions((prev) => {
      const defaultExpanded = groupedProjects[0] ? [groupedProjects[0].key] : [];
      const currentExpanded = prev ?? defaultExpanded;

      if (currentExpanded.includes(subdivisionKey)) {
        return currentExpanded.filter((key) => key !== subdivisionKey);
      }

      return [...currentExpanded, subdivisionKey];
    });
  }

  function toggleBuilder(builderKey: string) {
    setExpandedBuilders((prev) => {
      const defaultExpanded = groupedProjects[0]?.builders[0]
        ? [groupedProjects[0].builders[0].key]
        : [];
      const currentExpanded = prev ?? defaultExpanded;

      if (currentExpanded.includes(builderKey)) {
        return currentExpanded.filter((key) => key !== builderKey);
      }

      return [...currentExpanded, builderKey];
    });
  }

  function toggleStreet(streetKey: string) {
    setExpandedStreets((prev) => {
      const defaultExpanded = groupedProjects[0]?.builders[0]?.streets[0]
        ? [groupedProjects[0].builders[0].streets[0].key]
        : [];
      const currentExpanded = prev ?? defaultExpanded;

      if (currentExpanded.includes(streetKey)) {
        return currentExpanded.filter((key) => key !== streetKey);
      }

      return [...currentExpanded, streetKey];
    });
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-xl font-semibold">Projects (0)</h1>
          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <ImportProjectJobsButton className="w-full sm:w-auto" />
            <NewProjectButton
              initialBuilders={builders}
              initialSubdivisions={subdivisions}
              buttonClassName="w-full sm:w-auto"
            />
          </div>
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
            <h1 className="text-2xl font-semibold text-primary">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {filteredProjects.length} Project
              {filteredProjects.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="flex w-full flex-col items-start gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start">
              {hasActiveFilters && (
                <div className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:text-white">
                  <span className="inline-flex items-center gap-1">
                    <Filter className="size-3" />
                    Filters Active
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs sm:h-8 sm:gap-2 sm:text-sm"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                  >
                    <Filter className="size-3.5 sm:size-4" />
                    <span className="hidden sm:inline">Clear Filters</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </div>
              )}
              <div className="ml-auto sm:ml-0 inline-flex overflow-hidden rounded-md border bg-background">
                <Button
                  type="button"
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none border-0 cursor-pointer"
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant={view === "grouped" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-none border-0 border- cursor-pointer"
                  onClick={() => setView("grouped")}
                  aria-label="Grouped view"
                >
                  <Building2 className="size-4" />
                </Button>
              </div>
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
              buttonClassName="w-full sm:w-auto"
            />
            <ImportProjectJobsButton className="w-full sm:w-auto" />
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
          ) : view === "grouped" ? (
            <div className="space-y-3">
              {groupedProjects.map((subdivisionGroup) => {
                const isSubdivisionExpanded = effectiveExpandedSubdivisions.includes(
                  subdivisionGroup.key,
                );
                const subdivisionOption =
                  subdivisions.find(
                    (subdivision) =>
                      subdivision.name.trim().toLowerCase() ===
                      subdivisionGroup.label.trim().toLowerCase(),
                  ) ?? null;

                return (
                  <Card
                    key={subdivisionGroup.key}
                    className="overflow-hidden border-primary/20"
                  >
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        className="flex flex-1 flex-col items-start gap-2 text-left transition-colors hover:text-primary cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                        onClick={() => toggleSubdivision(subdivisionGroup.key)}
                      >
                        <div className="flex items-center gap-2 cursor-pointer">
                          <ChevronDown
                            className={cn(
                              "size-4 shrink-0 transition-transform cursor-pointer",
                              isSubdivisionExpanded && "rotate-180",
                            )}
                          />
                          <div className="text-base font-semibold ">
                            {subdivisionGroup.label}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-right">
                          {subdivisionGroup.projectCount}{" "}
                          {subdivisionGroup.projectCount === 1
                            ? "project"
                            : "projects"}{" "}
                          • {subdivisionGroup.totalJobCount} jobs •{" "}
                          {subdivisionGroup.openJobCount} open
                        </div>
                      </button>
                      <NewProjectButton
                        initialBuilders={builders}
                        initialSubdivisions={subdivisions}
                        initialSubdivisionId={subdivisionOption?.id}
                        buttonLabel="Add Project"
                        buttonClassName="w-full sm:w-auto"
                      />
                    </div>

                    {isSubdivisionExpanded && (
                      <div className="space-y-3 border-t p-3 sm:p-4">
                        {subdivisionGroup.builders.map((builderGroup) => {
                          const isBuilderExpanded = effectiveExpandedBuilders.includes(
                            builderGroup.key,
                          );

                          return (
                            <div key={builderGroup.key} className="space-y-2">
                              <button
                                type="button"
                                className="flex w-full flex-col items-start gap-2 rounded-md border bg-background p-3 text-left transition-colors hover:bg-muted/20 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                                onClick={() => toggleBuilder(builderGroup.key)}
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronDown
                                    className={cn(
                                      "size-4 shrink-0 transition-transform cursor-pointer",
                                      isBuilderExpanded && "rotate-180",
                                    )}
                                  />
                                  <div className="font-medium">
                                    {builderGroup.label}
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground sm:text-right">
                                  {builderGroup.projectCount}{" "}
                                  {builderGroup.projectCount === 1
                                    ? "project"
                                    : "projects"}{" "}
                                  • {builderGroup.totalJobCount} jobs •{" "}
                                  {builderGroup.openJobCount} open
                                </div>
                              </button>

                              {isBuilderExpanded && (
                                <div className="space-y-2 pl-2 sm:pl-5">
                                  {builderGroup.streets.map((streetGroup) => {
                                    const isStreetExpanded =
                                      effectiveExpandedStreets.includes(
                                        streetGroup.key,
                                      );

                                    return (
                                      <div key={streetGroup.key} className="space-y-2">
                                        <button
                                          type="button"
                                          className="flex w-full flex-col items-start gap-2 rounded-md border bg-muted/20 p-3 text-left transition-colors hover:bg-muted/35 cursor-pointer sm:flex-row sm:items-center sm:justify-between"
                                          onClick={() => toggleStreet(streetGroup.key)}
                                        >
                                          <div className="flex items-center gap-2">
                                            <ChevronDown
                                              className={cn(
                                                "size-4 shrink-0 transition-transform cursor-pointer",
                                                isStreetExpanded && "rotate-180",
                                              )}
                                            />
                                            <div className="font-medium">
                                              {streetGroup.label}
                                            </div>
                                          </div>
                                          <div className="text-xs text-muted-foreground sm:text-right">
                                            {streetGroup.projects.length}{" "}
                                            {streetGroup.projects.length === 1
                                              ? "project"
                                              : "projects"}{" "}
                                            • {streetGroup.totalJobCount} jobs •{" "}
                                            {streetGroup.openJobCount} open
                                          </div>
                                        </button>

                                        {isStreetExpanded && (
                                          <div className="space-y-2 pl-2 sm:pl-4">
                                            {streetGroup.projects.map((project) => {
                                              const isSelected =
                                                effectiveSelectedProjectId ===
                                                project.id;

                                              return (
                                                <Card
                                                  key={project.id}
                                                  className={cn(
                                                    "border-primary/10 p-3 transition-colors",
                                                    isSelected
                                                      ? "bg-primary/[0.03] ring-2 ring-primary/20"
                                                      : "hover:bg-primary/5",
                                                  )}
                                                  onClick={() =>
                                                    setSelectedProjectId(project.id)
                                                  }
                                                >
                                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="min-w-0 space-y-1">
                                                      <div className="break-words font-medium">
                                                        {project.project_address}
                                                      </div>
                                                      <div className="text-xs text-muted-foreground">
                                                        {project.job_count} jobs •{" "}
                                                        {project.open_job_count} open
                                                        • Last activity{" "}
                                                        {formatRelativeTime(
                                                          project.last_activity_at,
                                                        )}
                                                      </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                      {project.status ===
                                                      "completed" ? (
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
                                                          {statusLabel(
                                                            project.status,
                                                          )}
                                                        </Badge>
                                                      )}
                                                      <div
                                                        onClick={(event) =>
                                                          event.stopPropagation()
                                                        }
                                                      >
                                                        <ProjectCardActionsDropdown
                                                          project={project}
                                                          builders={builders}
                                                          subdivisions={subdivisions}
                                                          onViewProject={setSelectedProjectId}
                                                        />
                                                      </div>
                                                      <div
                                                        onClick={(event) =>
                                                          event.stopPropagation()
                                                        }
                                                      >
                                                        <DeleteProjectButton
                                                          projectId={project.id}
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </Card>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isSelected = effectiveSelectedProjectId === project.id;

              return (
                <Card
                  key={project.id}
                  className={cn(
                    "border-primary/10 p-4 transition-colors sm:p-5",
                    isSelected
                      ? "bg-primary/[0.03] ring-2 ring-primary/20"
                      : "hover:bg-primary/5",
                  )}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                          {project.job_count}{" "}
                          {project.job_count === 1 ? " Job" : " Jobs"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="break-words text-lg font-semibold leading-tight sm:text-xl">
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
                          <ProjectCardActionsDropdown
                            project={project}
                            builders={builders}
                            subdivisions={subdivisions}
                            onViewProject={setSelectedProjectId}
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
                        onClick={() => setSelectedProjectId(project.id)}
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

        <Card className="hidden h-fit border-primary/20 p-5 xl:sticky xl:top-4 xl:block">
          {selectedProject ? (
            <div className="space-y-5">
              <div>
                <div className="text-sm font-medium text-primary/80">
                  Selected Project
                </div>
                <div className="mt-2 text-3xl font-semibold leading-tight">
                  {selectedProject.project_address}
                </div>
              </div>

              <div className="rounded-md border border-primary/20 bg-primary/[0.03] p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-2xl font-semibold leading-none">
                      {selectedProject.job_count} {selectedProject.job_count === 1 ? "Job" : "Jobs"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {selectedProject.open_job_count === 0 ? "All jobs completed" : `${selectedProject.open_job_count} open job${selectedProject.open_job_count === 1 ? "" : "s"}`}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Last activity
                    </div>
                    <div className="mt-1 text-xl font-semibold leading-tight">
                      {formatRelativeTime(selectedProject.last_activity_at)} {formatRelativeTime(selectedProject.created_at) === "No activity yet" && "(Created " + formatRelativeTime(selectedProject.created_at) + ")"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Superintendents / GC:
                </div>
                {selectedProject.crew_names.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No Superintendents / GCs assigned.
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
