import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JobSyte — Construction Project Management",
    short_name: "JobSyte",
    description:
      "Manage projects, schedule jobs, track invoices, and keep field and office teams aligned in one workflow.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    categories: ["business", "productivity", "construction"],
    icons: [
      {
        src: "/image.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/jobsyte_safari.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
