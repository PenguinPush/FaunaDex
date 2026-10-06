import { fileURLToPath } from "node:url";

const backend = (process.env.BACKEND_URL || "http://127.0.0.1:5050").replace(
  /\/$/,
  "",
);
export default {
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  async rewrites() {
    return [
      ...["search", "status", "graph", "neighbors/:id"].map((path) => ({
        source: `/api/${path}`,
        destination: `${backend}/api/${path}`,
      })),
      {
        source: "/demo-images/:path*",
        destination: `${backend}/demo-images/:path*`,
      },
    ];
  },
};
