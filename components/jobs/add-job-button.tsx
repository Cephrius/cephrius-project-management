"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddJobDialog} from "@/components/jobs/add-job-dialog"

export function AddJobButton({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Add Job</Button>
            <AddJobDialog projectId={projectId} open={open} onOpenChange={setOpen} />
        </>
    )
}