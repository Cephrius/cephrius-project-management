const fd = new FormData();
fd.set("project_id", project.id);
fd.set("project_address", toTitleCase(projectAddress));

if (builder?.id) fd.set("builder_id", builder.id);
else fd.set("builder_name", builder?.name ?? "");

if (subdivision?.id) fd.set("subdivision_id", subdivision.id);
else fd.set("subdivision_name", subdivision?.name ?? "");

const res = await editProject(fd);
