import { easeOutBack, MOTION_MS } from "./motion.js";

// Temporary display offsets only: saved embeddings and neighbor distances never change.
export function createCursorSpacing(
  graph,
  renderer,
  container,
  pinned,
  constrain = (_id, _base, point) => point,
) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const bases = new Map();
  const offsets = new Map();
  let enabled = !preference.matches,
    pointer = null,
    frame = 0,
    lastFrame = 0,
    destroyed = false;
  let goals = new Map();
  graph.forEachNode((id, node) => bases.set(id, { x: node.x, y: node.y }));
  function apply() {
    graph.updateEachNodeAttributes(
      (id, attrs) => {
        const base = bases.get(id),
          offset = offsets.get(id);
        if (!base) return attrs;
        const point = constrain(id, base, {
          x: base.x + (offset?.x || 0),
          y: base.y + (offset?.y || 0),
        });
        return { ...attrs, ...point };
      },
      { attributes: ["x", "y"] },
    );
  }
  function tick(now) {
    frame = 0;
    if (destroyed) return;
    // Bound work on large maps, regardless of display refresh rate.
    if (now - lastFrame < 30) {
      frame = requestAnimationFrame(tick);
      return;
    }
    lastFrame = now;
    let moving = false;
    for (const [id, offset] of offsets) {
      const target = goals.get(id) || { x: 0, y: 0 };
      if (pinned(id)) continue;
      const progress = Math.min(1, (now - offset.started) / MOTION_MS);
      const eased = easeOutBack(progress);
      offset.x = offset.fromX + (target.x - offset.fromX) * eased;
      offset.y = offset.fromY + (target.y - offset.fromY) * eased;
      if (progress < 1) moving = true;
      else if (!target.x && !target.y) offsets.delete(id);
    }
    apply();
    if (moving) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (!frame && !destroyed) frame = requestAnimationFrame(tick);
  }
  function aim() {
    goals = new Map();
    if (enabled && pointer) {
      for (const [id, base] of bases) {
        if (!graph.hasNode(id)) continue;
        const screen = renderer.graphToViewport(base);
        const dx = screen.x - pointer.x,
          dy = screen.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        // Leave a quiet center so targets don't run away from a click.
        if (distance < 14 || distance > 110) continue;
        const push = 32 * Math.sin((Math.PI * (distance - 14)) / 96);
        const target = renderer.viewportToGraph({
          x: screen.x + (dx / distance) * push,
          y: screen.y + (dy / distance) * push,
        });
        goals.set(id, { x: target.x - base.x, y: target.y - base.y });
        if (!offsets.has(id)) offsets.set(id, { x: 0, y: 0 });
      }
    }
    const now = performance.now();
    for (const [id, offset] of offsets) {
      const target = goals.get(id) || { x: 0, y: 0 };
      if (target.x === offset.targetX && target.y === offset.targetY) continue;
      offset.fromX = offset.x;
      offset.fromY = offset.y;
      offset.targetX = target.x;
      offset.targetY = target.y;
      offset.started = now;
    }
    if (offsets.size) wake();
  }
  function reset() {
    pointer = null;
    goals.clear();
    offsets.clear();
    cancelAnimationFrame(frame);
    frame = 0;
    apply();
  }
  function move(event) {
    if (event.buttons) {
      reset();
      return;
    }
    if (!enabled || event.pointerType === "touch") return;
    const box = container.getBoundingClientRect();
    pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    aim();
  }
  function pause() {
    pointer = null;
    cancelAnimationFrame(frame);
    frame = 0;
  }
  function leave() {
    pointer = null;
    aim();
  }
  function preferenceChanged() {
    enabled = !preference.matches;
    reset();
  }
  function visibility() {
    if (document.hidden) reset();
  }
  container.addEventListener("pointermove", move);
  container.addEventListener("pointerleave", leave);
  container.addEventListener("pointerdown", pause);
  container.addEventListener("pointerup", leave);
  document.addEventListener("visibilitychange", visibility);
  renderer.getCamera().on("updated", reset);
  preference.addEventListener("change", preferenceChanged);
  return {
    // Restore before changing query overlays, then capture their new base positions.
    reset,
    sync() {
      reset();
      bases.clear();
      graph.forEachNode((id, node) => bases.set(id, { x: node.x, y: node.y }));
      renderer.refresh();
    },
    settle: aim,
    destroy() {
      reset();
      destroyed = true;
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      container.removeEventListener("pointerdown", pause);
      container.removeEventListener("pointerup", leave);
      document.removeEventListener("visibilitychange", visibility);
      renderer.getCamera().off("updated", reset);
      preference.removeEventListener("change", preferenceChanged);
    },
  };
}
