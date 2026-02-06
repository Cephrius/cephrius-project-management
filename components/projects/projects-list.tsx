"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";

type ProjectRow = {
  id: string;
  project_address: string;
  builder_name: string | null;
  subdivision: string | null;
};

export function ProjectsList({ projects }: { projects: ProjectRow[] }) {
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
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((p) => (
        <Link key={p.id} href={`/projects/${p.id}`}>
          <Card className="p-4 hover:bg-muted/40 transition">
            <div className="font-medium">{p.project_address}</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Builder: {p.builder_name}
            </div>
            {p.subdivision && (
              <div className="text-sm text-muted-foreground">
                Subdivision: {p.subdivision}
              </div>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
