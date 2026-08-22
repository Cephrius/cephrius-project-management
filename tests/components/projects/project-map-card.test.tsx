// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectMapCard } from "@/components/projects/project-map-card";

describe("ProjectMapCard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          found: true,
          provider: "google-maps",
          coordinates: { lat: 29.7854, lng: -95.8245 },
          query: "2065 Solstice Landing Drive, Katy, TX",
          status: "OK",
        }),
      }),
    );
  });

  it("asks Google Maps for only the current project's street line", async () => {
    render(
      <ProjectMapCard
        address="2065 Solstice Lndg Dr"
        city="Katy"
        mapboxToken="mapbox-token"
        state="TX"
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/maps/geocode?address=2065+Solstice+Lndg+Dr",
        { signal: expect.any(AbortSignal) },
      );
    });
  });

  it("renders a read-only satellite image at Google's coordinates", async () => {
    render(
      <ProjectMapCard
        address="2065 Solstice Lndg Dr"
        city="Katy"
        mapboxToken="mapbox-token"
        state="TX"
      />,
    );

    const map = await screen.findByRole("img", {
      name: "Satellite map for 2065 Solstice Lndg Dr",
    });
    expect(decodeURIComponent(map.getAttribute("src") ?? "")).toContain(
      "-95.8245,29.7854",
    );
  });

  it("reports when Mapbox cannot load the satellite image", async () => {
    render(
      <ProjectMapCard
        address="2065 Solstice Lndg Dr"
        city="Katy"
        mapboxToken="mapbox-token"
        state="TX"
      />,
    );

    fireEvent.error(
      await screen.findByRole("img", {
        name: "Satellite map for 2065 Solstice Lndg Dr",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Mapbox map could not load" }),
    ).toBeInTheDocument();
  });

  it("does not render any pin adjustment controls", async () => {
    render(
      <ProjectMapCard
        address="2065 Solstice Lndg Dr"
        city="Katy"
        mapboxToken="mapbox-token"
        state="TX"
      />,
    );

    await screen.findByRole("img", {
      name: "Satellite map for 2065 Solstice Lndg Dr",
    });
    expect(screen.queryByRole("button", { name: "Save pin" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open map fullscreen" })).toBeNull();
    expect(screen.queryByText(/double-click/i)).toBeNull();
  });
});
