// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
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

  it("renders the Mapbox Static URL as an image source after geocoding", async () => {
    render(
      <ProjectMapCard
        address="2065 Solstice Lndg Dr"
        city="Katy"
        mapboxToken="mapbox-token"
        state="TX"
      />,
    );

    const map = await screen.findByRole("img", {
      name: "Mapbox map for 2065 Solstice Lndg Dr",
    });

    expect(map).toHaveAttribute(
      "src",
      expect.stringContaining(
        "api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static",
      ),
    );
  });

  it("reports a Mapbox error when the static image cannot load", async () => {
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
        name: "Mapbox map for 2065 Solstice Lndg Dr",
      }),
    );

    expect(
      await screen.findByRole("heading", { name: "Mapbox map could not load" }),
    ).toBeInTheDocument();
  });
});
