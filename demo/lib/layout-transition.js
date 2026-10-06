import { easeOutBack, MOTION_MS } from "./motion.js";
// Interpolate positions and bounds together so switching coordinate systems doesn't jump.
export function animateLayout(
  graph,
  renderer,
  targets,
  bounds,
  cameraState,
  complete,
) {
  const starts = new Map();
  graph.forEachNode((id, attrs) => starts.set(id, { x: attrs.x, y: attrs.y }));
  const initialBounds = renderer.getCustomBBox() || renderer.getBBox();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = reduced.matches ? 0 : MOTION_MS;
  let frame = 0,
    started,
    last = -Infinity,
    cancelled = false;
  const mix = (a, b, t) => a + (b - a) * t;
  function paint(t) {
    renderer.setCustomBBox({
      x: initialBounds.x.map((value, i) =>
        mix(value, bounds.x[i], Math.min(1, t)),
      ),
      y: initialBounds.y.map((value, i) =>
        mix(value, bounds.y[i], Math.min(1, t)),
      ),
    });
    graph.updateEachNodeAttributes(
      (id, attrs) => {
        const from = starts.get(id),
          to = targets.get(id);
        return from && to
          ? { ...attrs, x: mix(from.x, to.x, t), y: mix(from.y, to.y, t) }
          : attrs;
      },
      { attributes: ["x", "y"] },
    );
    renderer.refresh();
  }
  function finish() {
    paint(1);
    reduced.removeEventListener("change", preferenceChanged);
    complete();
  }
  function tick(now) {
    if (cancelled) return;
    started ??= now;
    const progress = Math.min(1, (now - started) / duration);
    if (progress === 1) {
      frame = 0;
      finish();
      return;
    }
    if (now - last >= 30) {
      last = now;
      paint(easeOutBack(progress));
    }
    frame = requestAnimationFrame(tick);
  }
  function preferenceChanged() {
    if (reduced.matches && !cancelled) {
      cancelAnimationFrame(frame);
      frame = 0;
      renderer.getCamera().setState(cameraState);
      renderer.getCamera().animate(cameraState, { duration: 1 });
      finish();
    }
  }
  if (duration) {
    reduced.addEventListener("change", preferenceChanged);
    renderer.getCamera().animate(cameraState, {
      duration,
      easing: easeOutBack,
    });
    frame = requestAnimationFrame(tick);
  } else {
    renderer.getCamera().setState(cameraState);
    renderer.getCamera().animate(cameraState, { duration: 1 });
    finish();
  }
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    reduced.removeEventListener("change", preferenceChanged);
  };
}
