import {
  setupCameraMotion,
  easeOutBack,
  MOTION_MS,
  reducedMotion,
} from "./motion.js";
import Graph from "graphology";
import Sigma from "sigma";
import { animateLayout } from "./layout-transition.js";
import { createCursorSpacing } from "./cursor-spacing.js";
import { scopeGraphInput } from "./graph-input.js";
import {
  cosineDistance,
  inverseLogRadius,
  radialPositions,
  keepRadius,
} from "./search-layout.js";

export function createNeighborGraph(root, DemoMotion) {
  let disposed = false;
  const requests = new AbortController();
  const fetch = (url, options = {}) =>
    window.fetch(url, { ...options, signal: requests.signal });
  const el = (id) => root.querySelector(`#${id}`);
  // Sigma's camera ratio is the inverse of magnification.
  const SEARCH_CAMERA = { x: 0.5, y: 0.5, angle: 0, ratio: 1 / 3 };
  const COLLECTION_CAMERA = { x: 0.5, y: 0.5, angle: 0, ratio: 1 };
  const defaultCamera = () => (radial ? SEARCH_CAMERA : COLLECTION_CAMERA);

  function resetCamera() {
    if (!renderer) return;
    const camera = renderer.getCamera();
    camera.setState(defaultCamera());
    // Supersede an in-flight focus/zoom animation without interpolating from a fitted view.
    camera.animate(defaultCamera(), { duration: 1 });
  }

  function layoutBounds() {
    if (radial) return { x: [-1, 1], y: [-1, 1] };
    const points = [...collectionPositions.values()];
    if (!points.length) return { x: [-1, 1], y: [-1, 1] };
    const xs = points.map((p) => p.x),
      ys = points.map((p) => p.y);
    const minX = Math.min(...xs),
      maxX = Math.max(...xs);
    const minY = Math.min(...ys),
      maxY = Math.max(...ys);
    const half = Math.max(maxX - minX, maxY - minY, 0.001) / 2;
    const x = (minX + maxX) / 2,
      y = (minY + maxY) / 2;
    return { x: [x - half, x + half], y: [y - half, y + half] };
  }

  let graph = new Graph(),
    renderer,
    loading,
    selected = null,
    hovered = null;
  let active = new Set(),
    matches = new Set(),
    original,
    queryPoint,
    count = 10,
    revision = 0;
  const nameIds = new Map();
  let spacing,
    radial = false,
    rings,
    releaseInput,
    cancelTransition,
    transitioning = false;
  const collectionPositions = new Map();
  const centerKey = () =>
    queryPoint?.animal_id != null ? String(queryPoint.animal_id) : "query";

  let ringView = "";
  function drawRings() {
    if (!rings || !renderer) return;
    rings.style.display = radial && !transitioning ? "block" : "none";
    if (!radial || transitioning) {
      ringView = "";
      return;
    }
    const ns = "http://www.w3.org/2000/svg";
    const center = renderer.graphToViewport({ x: 0, y: 0 });
    const outer = renderer.graphToViewport({ x: 1, y: 0 });
    const view = `${center.x},${center.y},${outer.x},${outer.y}`;
    if (view === ringView) return;
    ringView = view;
    rings.replaceChildren();
    for (const distance of [0, 0.5, 0.7, 0.85, 1]) {
      const edge = renderer.graphToViewport({
        x: inverseLogRadius(distance),
        y: 0,
      });
      const pixels = Math.hypot(edge.x - center.x, edge.y - center.y);
      const circle = document.createElementNS(ns, "circle");
      Object.entries({
        cx: center.x,
        cy: center.y,
        r: pixels,
        fill: "none",
        stroke: "#8894a3",
        "stroke-opacity": ".3",
        "stroke-dasharray": "3 5",
      }).forEach(([k, v]) => circle.setAttribute(k, v));
      const label = document.createElementNS(ns, "text");
      Object.entries({
        x: center.x + 5,
        y: center.y - pixels - 4,
        fill: "#737373",
        "font-size": "10",
        stroke: "white",
        "stroke-width": "3",
        "paint-order": "stroke",
      }).forEach(([k, v]) => label.setAttribute(k, v));
      label.textContent = `${distance === 1 ? "1" : distance}`;
      rings.append(circle, label);
    }
  }

  function startSpacing() {
    if (!renderer) return;
    spacing = createCursorSpacing(
      graph,
      renderer,
      el("neighbor-graph"),
      (id) => id === hovered || id === selected || id === centerKey(),
      (_id, base, point) => (radial ? keepRadius(base, point) : point),
    );
  }

  function applyLayout(animate = true) {
    cancelTransition?.();
    cancelTransition = null;
    spacing?.destroy();
    spacing = null;
    const positions =
      radial && queryPoint
        ? radialPositions(collectionPositions, queryPoint)
        : collectionPositions;
    const targets = new Map();
    graph.forEachNode((id, attrs) => {
      targets.set(
        id,
        id === centerKey() && queryPoint
          ? radial
            ? {
                x: 0,
                y: 0,
              }
            : queryPoint
          : positions.get(id) || attrs,
      );
    });
    el("graph-layout").disabled = !queryPoint;
    el("graph-layout").textContent = radial
      ? "Show Full Animal Database"
      : "Show Search Distances";
    if (renderer && animate) {
      transitioning = true;
      drawRings();
      cancelTransition = animateLayout(
        graph,
        renderer,
        targets,
        layoutBounds(),
        defaultCamera(),
        () => {
          transitioning = false;
          startSpacing();
          drawRings();
        },
      );
    } else {
      transitioning = false;
      graph.updateEachNodeAttributes(
        (id, attrs) => ({
          ...attrs,
          x: targets.get(id).x,
          y: targets.get(id).y,
        }),
        { attributes: ["x", "y"] },
      );
      if (renderer) {
        renderer.setCustomBBox(layoutBounds());
        renderer.refresh();
        startSpacing();
        resetCamera();
      }
      drawRings();
    }
  }

  function refresh() {
    const focus = hovered || selected;
    active = new Set(
      focus && graph.hasNode(focus) ? [focus, ...graph.neighbors(focus)] : [],
    );
    renderer?.refresh();
  }

  function focus(id) {
    const point = renderer?.getNodeDisplayData(id);
    if (point)
      renderer.getCamera().animate(
        { x: point.x, y: point.y, ratio: 0.22 },
        {
          duration: reducedMotion() ? 1 : MOTION_MS,
          easing: easeOutBack,
        },
      );
  }

  function showDistances() {
    const fragment = document.createDocumentFragment();
    const distances = Object.entries(queryPoint?.distances || {})
      .filter(([id]) => graph.hasNode(id) && id !== centerKey())
      .sort((a, b) => a[1] - b[1]);
    for (const [id, value] of distances) {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "button-color-sweep cursor-pointer px-4 py-2.5 disabled:cursor-wait disabled:opacity-50 origin-center motion-safe:enabled:active:[transform:scale(1.1,0.9)] transition-[transform,background-color,border-color,box-shadow,color,opacity,outline-color] duration-300 ease-out-back motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#3472ac] flex items-center justify-between gap-3 p-2! text-left text-xs font-normal shadow-none bg-[#f3f6f8] hover:bg-[#e9eef3] motion-safe:[@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[transform:translateX(3px)] rounded-none";
      const name = document.createElement("span");
      name.textContent = graph.getNodeAttribute(id, "label");
      const distance = document.createElement("span");
      distance.className = "text-neutral-500 tabular-nums";
      distance.textContent = cosineDistance(value).toFixed(4);
      button.append(name, distance);
      button.onclick = () => select(id);
      fragment.append(button);
    }
    DemoMotion.update(el("graph-neighbors"), () =>
      el("graph-neighbors").replaceChildren(fragment),
    );
    el("graph-neighbors").scrollTop = 0;
  }

  async function select(id) {
    if (!graph.hasNode(id)) return;
    selected = id;
    const requestRevision = ++revision;
    refresh();
    DemoMotion.update(el("graph-selection"), () => {
      el("graph-selection").hidden = false;
      el("graph-node-name").textContent = graph.getNodeAttribute(id, "label");
    });
    DemoMotion.update(el("graph-neighbors"), () =>
      el("graph-neighbors").replaceChildren(),
    );
    if (id === centerKey() && original) {
      if (!radial) {
        radial = true;
        applyLayout();
      }
      showDistances();

      return;
    }

    try {
      const response = await fetch(
        `/api/neighbors/${encodeURIComponent(id)}?count=${count}&map=1`,
      );
      const data = await response.json();
      if (disposed) return;
      if (!response.ok)
        throw new Error(data.error || "Could not load neighbors.");
      if (requestRevision !== revision) return;
      original = data.graph;
      queryPoint = data.map_query;
      hovered = null;
      queryOverlay();
      showDistances();
    } catch (error) {
      if (requestRevision === revision) console.error(error);
    }
  }

  function queryOverlay() {
    spacing?.destroy();
    spacing = null;
    if (graph.hasNode("query")) graph.dropNode("query");
    matches = new Set();
    if (queryPoint && original?.nodes.length) {
      const center = centerKey();
      if (center === "query")
        graph.addNode(center, {
          x: queryPoint.x,
          y: queryPoint.y,
          label: "Your input",
          size: 0,
          color: "#8894a3",
          forceLabel: false,
          zIndex: 0,
        });
      original.nodes.slice(1).forEach((node) => {
        const id = String(node.animal_id);
        if (!graph.hasNode(id)) return;
        matches.add(id);
        if (center === "query")
          graph.addEdge(center, id, { color: "#9f1838", size: 1.5 });
      });
    }
    radial = Boolean(queryPoint);
    applyLayout();
    refresh();
  }

  async function reload(invalidateQuery = true) {
    if (loading) return loading;
    if (invalidateQuery) queryPoint = null;
    loading = (async () => {
      const response = await fetch("/api/graph");
      const data = await response.json();
      if (disposed) return;
      if (!response.ok)
        throw new Error(data.error || "Could not load the collection.");
      revision++;
      selected = hovered = null;
      cancelTransition?.();
      cancelTransition = null;
      transitioning = false;
      spacing?.destroy();
      spacing = null;
      releaseInput?.();
      renderer?.kill();
      renderer = null;
      rings?.remove();
      rings = null;
      graph = new Graph();
      nameIds.clear();
      collectionPositions.clear();
      const options = document.createDocumentFragment();
      data.nodes.forEach((node) => {
        const id = String(node.animal_id);
        graph.addNode(id, {
          x: node.x,
          y: node.y,
          label: node.name,
          size: 1.8,
          color: "#8894a3",
        });
        collectionPositions.set(id, { x: node.x, y: node.y });
        nameIds.set(node.name.toLocaleLowerCase(), id);
        const option = document.createElement("option");
        option.value = node.name;
        options.append(option);
      });
      el("graph-names").replaceChildren(options);
      data.edges.forEach((edge) =>
        graph.addEdge(String(edge.source), String(edge.target), {
          size: 0.35,
          color: "rgba(36, 48, 68, 0.18)",
        }),
      );
      queryOverlay();
      renderer = new Sigma(graph, el("neighbor-graph"), {
        autoRescale: false,
        stagePadding: 0,
        renderLabels: true,
        labelDensity: 0.08,
        labelRenderedSizeThreshold: 5,
        labelSize: 12,
        zoomToSizeRatioFunction: () => Math.sqrt(COLLECTION_CAMERA.ratio),
        zIndex: true,
        minCameraRatio: 0.015,
        maxCameraRatio: 3,
        nodeReducer(id, attributes) {
          const highlighted = active.has(id),
            match = matches.has(id),
            isQuery = Boolean(queryPoint) && id === centerKey();
          if (id === "query")
            return {
              ...attributes,
              size: 0,
              label: "",
              forceLabel: false,
              zIndex: 0,
            };
          return {
            ...attributes,
            color: isQuery
              ? "#243044"
              : highlighted || match
                ? "#9f1838"
                : active.size
                  ? "#ddd"
                  : "#8894a3",
            size: id === hovered || id === selected ? 4 : 1.8,
            zIndex: highlighted || isQuery ? 2 : 0,
            forceLabel: highlighted || match || isQuery,
          };
        },
        edgeReducer(id, attributes) {
          const [source, target] = graph.extremities(id);
          const focusId = hovered || selected;
          const highlighted =
            focusId && (source === focusId || target === focusId);
          return {
            ...attributes,
            color: highlighted ? "#9f1838" : "rgba(36, 48, 68, 0.18)",
            size: highlighted ? 1.5 : 0.35,
            hidden: Boolean(active.size && !highlighted),
          };
        },
      });
      setupCameraMotion(renderer.getCamera());
      releaseInput = scopeGraphInput(renderer, el("neighbor-graph"));
      ringView = "";
      rings = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      rings.setAttribute("aria-hidden", "true");
      rings.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:hidden";
      el("neighbor-graph").append(rings);
      renderer.on("afterRender", drawRings);
      applyLayout(false);
      renderer.on("enterNode", ({ node }) => {
        hovered = node;
        el("neighbor-graph").style.cursor = "pointer";
        refresh();
      });
      renderer.on("leaveNode", () => {
        hovered = null;
        el("neighbor-graph").style.cursor = "";
        refresh();
        spacing?.settle();
      });
      renderer.on("clickNode", ({ node }) => select(node));
      renderer.on("clickStage", () => {
        revision++;
        selected = null;
        DemoMotion.update(el("graph-selection"), () => {
          el("graph-selection").hidden = true;
        });

        refresh();
        spacing?.settle();
      });
      el("graph-caption").textContent =
        `${data.total.toLocaleString()} animals (and counting...)`;
      DemoMotion.update(el("graph-selection"), () => {
        el("graph-selection").hidden = true;
      });
    })()
      .catch(
        (error) =>
          !disposed && console.error("Could not load the animal map:", error),
      )
      .finally(() => {
        loading = null;
      });
    return loading;
  }

  el("graph-layout").onclick = () => {
    radial = !radial && Boolean(queryPoint);
    applyLayout();
  };
  el("graph-reset").onclick = () => {
    selected = hovered = null;
    applyLayout();
    refresh();
  };
  el("graph-zoom-in").onclick = () =>
    renderer?.getCamera().animatedZoom({
      duration: reducedMotion() ? 1 : MOTION_MS,
      easing: easeOutBack,
    });
  el("graph-zoom-out").onclick = () =>
    renderer?.getCamera().animatedUnzoom({
      duration: reducedMotion() ? 1 : MOTION_MS,
      easing: easeOutBack,
    });

  function find() {
    const id = nameIds.get(el("graph-find").value.trim().toLocaleLowerCase());
    if (id) {
      select(id);
    } else {
      el("graph-find").setCustomValidity(
        "Choose an animal name from the suggestions.",
      );
      el("graph-find").reportValidity();
    }
  }

  el("graph-find").oninput = () => el("graph-find").setCustomValidity("");
  el("graph-find-button").onclick = find;
  el("graph-find").onkeydown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      find();
    }
  };
  reload(false);
  return {
    destroy() {
      disposed = true;
      revision++;
      requests.abort();
      cancelTransition?.();
      spacing?.destroy();
      releaseInput?.();
      renderer?.kill();
      renderer = null;
      rings?.remove();
      root.querySelectorAll("button, input").forEach((element) => {
        element.onclick = element.oninput = element.onkeydown = null;
      });
    },
    reload,
    async showAnimal(animalId) {
      await reload();
      if (!renderer || !graph.hasNode(String(animalId)))
        throw new Error(
          "Animal saved, but the map could not refresh. Reload the page to explore it.",
        );
      const response = await fetch(
        `/api/neighbors/${encodeURIComponent(animalId)}?count=10&map=1`,
      );
      const data = await response.json();
      if (disposed) return;
      if (!response.ok)
        throw new Error(
          data.error || "Could not load the animal’s similarities.",
        );
      await this.set(data.graph, 10, data.map_query);
    },
    beginSearch() {
      revision++;
    },
    async set(data, requestedCount, point) {
      original = data;
      queryPoint = point;
      count = requestedCount;
      await loading;
      if (!renderer) return;
      queryOverlay();
      if (point) select(centerKey());
      else {
        selected = null;
        DemoMotion.update(el("graph-selection"), () => {
          el("graph-selection").hidden = true;
        });
        refresh();
      }
    },
    selectMatch(index) {
      const node = original?.nodes[index + 1];
      if (node) {
        const id = String(node.animal_id);
        select(id);
      }
    },
  };
}
