"use client";

import { useRef, useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { importProjectsJobsCsv } from "@/app/(app)/projects/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ImportSummary = {
  dryRun: boolean;
  rowsRead: number;
  buildersCreated: number;
  subdivisionsCreated: number;
  projectsCreated: number;
  jobsCreated: number;
  jobsSkippedDuplicate: number;
  rowsSkippedInvalid: number;
  rowErrors: string[];
};

export function ImportProjectJobsButton({
  className,
}: {
  className?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [defaultBuilder, setDefaultBuilder] = useState("");
  const [defaultSubdivision, setDefaultSubdivision] = useState("");
  const [dryRun, setDryRun] = useState(true);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [isPending, startTransition] = useTransition();

  function resetForm() {
    setFile(null);
    setDefaultBuilder("");
    setDefaultSubdivision("");
    setDryRun(true);
    setSummary(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onImport() {
    if (!file) {
      toast.error("Select a CSV file first.");
      return;
    }

    const fd = new FormData();
    fd.set("file", file);
    if (defaultBuilder.trim()) fd.set("default_builder", defaultBuilder.trim());
    if (defaultSubdivision.trim()) {
      fd.set("default_subdivision", defaultSubdivision.trim());
    }
    fd.set("dry_run", dryRun ? "true" : "false");

    startTransition(async () => {
      const result = await importProjectsJobsCsv(fd);
      if (!result.ok) {
        toast.error(result.message || "Import failed.");
        return;
      }

      setSummary(result.summary);
      if (result.summary.dryRun) {
        toast.success("Dry run complete. Review summary below.");
      } else {
        toast.success("Import complete.");
        router.refresh();
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen && !isPending) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("gap-2", className)}
        >
          <Upload className="size-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Projects and Jobs</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload a CSV to create missing projects and append jobs to existing
            matching projects.
          </p>

          <div className="space-y-2">
            <Label htmlFor="projects-jobs-import-file">CSV File</Label>
            <Input
              id="projects-jobs-import-file"
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              disabled={isPending}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setSummary(null);
              }}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projects-jobs-default-builder">
                Default Builder (Optional)
              </Label>
              <Input
                id="projects-jobs-default-builder"
                value={defaultBuilder}
                onChange={(event) => setDefaultBuilder(event.target.value)}
                placeholder="Acme Homes"
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projects-jobs-default-subdivision">
                Default Subdivision (Optional)
              </Label>
              <Input
                id="projects-jobs-default-subdivision"
                value={defaultSubdivision}
                onChange={(event) => setDefaultSubdivision(event.target.value)}
                placeholder="North Ridge"
                disabled={isPending}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dryRun}
              disabled={isPending}
              onChange={(event) => setDryRun(event.target.checked)}
            />
            Dry run only (validate and preview, do not insert)
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={onImport}
            >
              {isPending ? "Importing..." : dryRun ? "Run Dry Import" : "Import"}
            </Button>
          </div>

          {summary && (
            <Card className="space-y-3 p-4">
              <div className="text-sm font-medium">
                {summary.dryRun ? "Dry Run Summary" : "Import Summary"}
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>Rows read: {summary.rowsRead}</div>
                <div>Builders created: {summary.buildersCreated}</div>
                <div>Subdivisions created: {summary.subdivisionsCreated}</div>
                <div>Projects created: {summary.projectsCreated}</div>
                <div>Jobs created: {summary.jobsCreated}</div>
                <div>Duplicates skipped: {summary.jobsSkippedDuplicate}</div>
                <div>Invalid/error rows: {summary.rowsSkippedInvalid}</div>
              </div>
              {summary.rowErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-destructive">
                    Row Errors
                  </div>
                  <div className="max-h-44 space-y-1 overflow-y-auto rounded-md border p-2 text-xs">
                    {summary.rowErrors.map((message) => (
                      <div key={message} className="break-words text-destructive">
                        {message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
