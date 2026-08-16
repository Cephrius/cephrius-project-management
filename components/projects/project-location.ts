export type ProjectLocationFields = {
  project_address: string;
  project_city?: string | null;
  project_state?: string | null;
};

function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function getAddressParts(projectAddress: string) {
  const [street = "", city = "", stateAndZip = ""] = projectAddress
    .split(",")
    .map((part) => normalizeWhitespace(part));
  const state = stateAndZip.split(/\s+/)[0] ?? "";

  return {
    street,
    city,
    state,
  };
}

export function getProjectStreetTitle(project: ProjectLocationFields) {
  return getAddressParts(project.project_address).street;
}

export function getProjectLocationSubtitle(project: ProjectLocationFields) {
  const fallback = getAddressParts(project.project_address);
  const city = normalizeWhitespace(project.project_city ?? "") || fallback.city;
  const state = (
    normalizeWhitespace(project.project_state ?? "") || fallback.state
  ).toUpperCase();

  if (city && state) return `${city}, ${state}`;
  return city || state;
}

export function getProjectMapAddress(project: ProjectLocationFields) {
  return [getProjectStreetTitle(project), getProjectLocationSubtitle(project)]
    .filter(Boolean)
    .join(", ");
}
