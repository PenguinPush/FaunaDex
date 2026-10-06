import { createPageMotion } from "./motion";

export function createGraphPanel(root) {
  const $ = (id) => root.querySelector(`#${id}`);
  const motion = createPageMotion(root);
  const requests = new AbortController();
  let graph,
    disposed = false,
    scrollFrame = 0;
  const ready = import("./graph").then(({ createNeighborGraph }) => {
    if (!disposed) graph = createNeighborGraph(root, motion);
    return graph;
  });
  // A rejected graph import is reported by the operation awaiting it, not as an unhandled promise.
  ready.catch((error) => {
    if (!disposed) console.error("Could not initialize the graph:", error);
  });
  async function api(path, options) {
    const response = await fetch(path, { ...options, signal: requests.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }
  function message(id, text, error = false) {
    if (disposed) return Promise.resolve();
    return motion.update($(id), () => {
      $(id).textContent = text;
      $(id).classList.toggle("error", error);
    });
  }
  const status = (text, error = false) => message("search-status", text, error);
  return {
    status,
    async search(body, mode) {
      status("Finding matches…");
      motion.update($("results"), () => {
        $("results").hidden = true;
      });
      try {
        const controller = await ready;
        if (disposed) return;
        controller.beginSearch();
        const data = await api("/api/search", { method: "POST", body });
        if (disposed) return;
        const appearance = motion.update(
          $("results"),
          () => {
            $("results").hidden = false;
            $("query-label").textContent =
              mode === "image" ? "Visible Features" : "Given Description";
            $("query-text").textContent = data.query;
            $("best-match").textContent =
              data.matches[0]?.name || "No animal found";
          },
          { bounce: true },
        );
        await controller.set(data.graph, 10, data.map_query);
        await appearance;
        await status("");
        if (!disposed && window.matchMedia("(max-width: 1023px)").matches) {
          scrollFrame = requestAnimationFrame(() => {
            if (!disposed)
              $("neighbor-graph").scrollIntoView({
                behavior: motion.reducedMotion() ? "instant" : "smooth",
                block: "start",
              });
          });
        }
      } catch (error) {
        if (!disposed) status(error.message, true);
      }
    },
    async addAnimal(event) {
      event.preventDefault();
      if ($("add-button").disabled) return;
      $("add-button").disabled = true;
      message("add-status", "Adding animal…");
      try {
        const controller = await ready;
        if (disposed) return;
        const data = await api("/api/animals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: $("animal-name").value }),
        });
        if (disposed) return;
        message("add-status", `Loading similarities for ${data.name}…`);
        await controller.showAnimal(data.animal_id);
        if (disposed) return;
        motion.update($("results"), () => {
          $("results").hidden = true;
        });
        message(
          "add-status",
          data.added
            ? `${data.name} added — showing its similarities.`
            : `Showing similarities for ${data.name}.`,
        );
      } catch (error) {
        if (!disposed) message("add-status", error.message, true);
      } finally {
        if (!disposed) $("add-button").disabled = false;
      }
    },
    destroy() {
      disposed = true;
      requests.abort();
      cancelAnimationFrame(scrollFrame);
      graph?.destroy();
      motion.destroy();
    },
  };
}
