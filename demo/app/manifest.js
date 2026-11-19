import { site } from "../lib/site";

export default function manifest() {
  return {
    name: "FaunaDex",
    short_name: "FaunaDex",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#edf0ef",
    theme_color: "#edf0ef",
    icons: [
      { src: "/static/dex-mark.png", sizes: "840x805", type: "image/png" },
    ],
  };
}
