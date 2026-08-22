"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  MapPin,
  Maximize2,
  RotateCw,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  getProjectMapAddress,
  getProjectStreetTitle,
} from "@/components/projects/project-location";
import type { MapLocationResponse } from "@/lib/maps/google-maps";
import { buildMapboxStaticImageUrl } from "@/lib/maps/mapbox";

type GeocodeState = "idle" | "loading" | "found" | "not-found" | "error";

type ProjectMapCardProps = {
  address: string;
  city?: string | null;
  mapboxToken: string;
  state?: string | null;
  subdivision?: string | null;
};

export function ProjectMapCard({
  address,
  city,
  mapboxToken,
  state: projectState,
  subdivision,
}: ProjectMapCardProps) {
  const [state, setState] = useState<GeocodeState>("idle");
  const [status, setStatus] = useState<string | null>(null);
  const [mapQuery, setMapQuery] = useState("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const projectLocation = {
    project_address: address,
    project_city: city,
    project_state: projectState,
  };
  const streetAddress = getProjectStreetTitle(projectLocation);
  // Google keeps city/state context for accuracy; the UI shows only the street.
  const normalizedAddress = getProjectMapAddress(projectLocation);
  const normalizedSubdivision = subdivision?.trim() ?? "";

  const mapImageUrl = useMemo(() => {
    if (!coordinates) return "";

    return buildMapboxStaticImageUrl({
      accessToken: mapboxToken,
      markers: [{ ...coordinates, label: "1" }],
    });
  }, [coordinates, mapboxToken]);

  const directionsUrl = useMemo(() => {
    const url = new URL("https://www.google.com/maps/dir/");
    url.searchParams.set("api", "1");
    url.searchParams.set("destination", mapQuery || normalizedAddress);
    return url.toString();
  }, [mapQuery, normalizedAddress]);

  useEffect(() => {
    const controller = new AbortController();

    async function validateAddress() {
      if (!normalizedAddress) {
        setStatus("INVALID_REQUEST");
        setMapQuery("");
        setCoordinates(null);
        setState("not-found");
        setDialogOpen(true);
        return;
      }

      if (!mapboxToken) {
        setStatus("MAPBOX_CONFIGURATION_ERROR");
        setMapQuery("");
        setCoordinates(null);
        setState("error");
        setDialogOpen(true);
        return;
      }

      setState("loading");
      setStatus(null);
      setMapQuery("");
      setCoordinates(null);

      try {
        // Google owns address validation/search. Mapbox only receives the
        // exact coordinates Google returns for the verified street address.
        const params = new URLSearchParams({ address: normalizedAddress });
        if (normalizedSubdivision) {
          params.set("subdivision", normalizedSubdivision);
        }

        const response = await fetch(
          `/api/maps/geocode?${params.toString()}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as MapLocationResponse;

        if (controller.signal.aborted) return;

        setStatus(payload.status);
        const googleCoordinates = payload.coordinates;
        if (
          response.ok &&
          payload.found &&
          payload.provider === "google-maps" &&
          typeof googleCoordinates?.lat === "number" &&
          typeof googleCoordinates.lng === "number"
        ) {
          setMapQuery(payload.query?.trim() || normalizedAddress);
          // Mapbox receives only the coordinates resolved by Google Maps.
          setCoordinates(googleCoordinates);
          setState("found");
          return;
        }

        setMapQuery("");
        setCoordinates(null);
        setState(response.status >= 500 ? "error" : "not-found");
        setDialogOpen(true);
      } catch (error) {
        if (controller.signal.aborted) return;

        setStatus(error instanceof Error ? error.name : "NETWORK_ERROR");
        setMapQuery("");
        setCoordinates(null);
        setState("error");
        setDialogOpen(true);
      }
    }

    void validateAddress();

    return () => controller.abort();
  }, [mapboxToken, normalizedAddress, normalizedSubdivision, requestKey]);

  const isMapReady = state === "found" && Boolean(mapImageUrl);
  const modalTitle =
    status === "MAPBOX_CONFIGURATION_ERROR"
      ? "Mapbox is not configured"
      : status === "MAPBOX_IMAGE_ERROR"
      ? "Mapbox map could not load"
      : status === "CONFIGURATION_ERROR"
      ? "Google address search is not configured"
      : "Address Not Found";
  const modalDescription =
    status === "MAPBOX_CONFIGURATION_ERROR"
      ? "Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to enable project map views."
      : status === "MAPBOX_IMAGE_ERROR"
      ? "Mapbox rejected or could not deliver the project map image. Check the access token restrictions and try again."
      : status === "CONFIGURATION_ERROR"
      ? "Add GOOGLE_MAPS_API_KEY to enable project address search."
      : `Google Maps API could not find "${streetAddress}". Check the project address and try again.`;

  function handleMapImageError() {
    setStatus("MAPBOX_IMAGE_ERROR");
    setState("error");
    setFullscreenOpen(false);
    setDialogOpen(true);
  }

  return (
    <>
      <Card className="flex flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Project Satellite Map</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {streetAddress}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Retry map lookup"
            onClick={() => setRequestKey((current) => current + 1)}
          >
            <RotateCw className="size-4" />
          </Button>
        </div>

        <div className="relative mt-4 flex aspect-[4/3] overflow-hidden rounded-md border bg-muted/40">
          {isMapReady ? (
            <>
              {/* Mapbox marker URLs contain parentheses, which are invalid in an
                  unquoted CSS url(). An image source avoids that parsing failure. */}
              <Image
                src={mapImageUrl}
                alt={`Mapbox map for ${streetAddress}`}
                fill
                priority={false}
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
                unoptimized
                onError={handleMapImageError}
              />
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="absolute top-2 right-2 bg-background/95 shadow-sm"
                aria-label="Open map fullscreen"
                onClick={() => setFullscreenOpen(true)}
              >
                <Maximize2 className="size-4" />
              </Button>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <div className="max-w-60">
                {state === "loading" ? (
                  <RotateCw className="mx-auto size-6 animate-spin text-muted-foreground" />
                ) : state === "not-found" || state === "error" ? (
                  <AlertTriangle className="mx-auto size-6 text-destructive" />
                ) : (
                  <MapPin className="mx-auto size-6 text-muted-foreground" />
                )}
                <div className="mt-3 text-sm font-medium">
                  {state === "loading"
                    ? "Finding address..."
                    : "Map unavailable"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {state === "loading"
                    ? "Checking Google Maps API before rendering the project map."
                    : "Use retry after updating the address or API key."}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
          <span className="text-xs text-muted-foreground">
            {status
              ? `Google search: ${status} · Mapbox satellite view`
              : "Mapbox satellite view"}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            disabled={!normalizedAddress}
          >
            <a href={directionsUrl} target="_blank" rel="noreferrer">
              Directions
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        </div>
      </Card>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="text-destructive" />
            </AlertDialogMedia>
            <AlertDialogTitle>{modalTitle}</AlertDialogTitle>
            <AlertDialogDescription>{modalDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          showCloseButton
          className="h-[100dvh] max-h-[100dvh] max-w-[100vw] gap-0 overflow-hidden rounded-none border-0 p-0 ring-0 sm:max-w-[100vw]"
        >
          <div className="relative h-full w-full bg-muted/40">
            {isMapReady ? (
              <Image
                src={mapImageUrl}
                alt={`Fullscreen Mapbox map for ${streetAddress}`}
                fill
                sizes="100vw"
                className="object-cover"
                unoptimized
                onError={handleMapImageError}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Map unavailable
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
