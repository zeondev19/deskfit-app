import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DeskFit",
    short_name: "DeskFit",
    description: "A 2D desk setup planner for visualizing and validating workspace layouts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f4",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml"
      }
    ]
  };
}
