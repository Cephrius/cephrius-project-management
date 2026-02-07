"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import type { ProjectListItem } from "@/components/projects/types";

export function ProjectsTable({ projects }: { projects: ProjectListItem[] }) {
  if (projects.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-sm text-muted-foreground">
          No projects match your search.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 py-3">Project Address</TableHead>
            <TableHead className="px-4 py-3">Builder</TableHead>
            <TableHead className="px-4 py-3">Subdivision</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="px-4 py-3">
                <Link
                  href={`/projects/${project.id}`}
                  className="font-medium hover:underline"
                >
                  {project.project_address}
                </Link>
              </TableCell>
              <TableCell className="px-4 py-3">
                {project.builder_name ?? "Unassigned"}
              </TableCell>
              <TableCell className="px-4 py-3">
                {project.subdivision ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
