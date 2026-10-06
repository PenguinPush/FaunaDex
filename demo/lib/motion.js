// Shared with portfolio-v2/src/styles/globals.css and navButtonLarge.js.
export const MOTION_MS = 300;
export const EASE_OUT_BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";
export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export function easeOutBack(progress) {
  if (progress <= 0 || progress >= 1) return Math.max(0, Math.min(1, progress));
  const bezier = (t, a, b) =>
    3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t ** 2 * b + t ** 3;
  let low = 0,
    high = 1;
  for (let i = 0; i < 18; i++) {
    const mid = (low + high) / 2;
    if (bezier(mid, 0.34, 0.64) < progress) low = mid;
    else high = mid;
  }
  return bezier((low + high) / 2, 1.56, 1);
}

export function setupCameraMotion(camera) {
  const animate = camera.animate.bind(camera);
  camera.animate = (state, options = {}, callback) =>
    animate(
      state,
      {
        ...options,
        duration: reducedMotion() || options.duration === 1 ? 1 : MOTION_MS,
        easing: easeOutBack,
      },
      callback,
    );
}

export function createPageMotion(root) {
  const removers = [];
  const activeAnimations = new Set();
  const animations = new WeakMap();
  function update(element, mutate) {
    const before = element.getBoundingClientRect();
    const oldStyle = getComputedStyle(element);
    const oldMarginTop = element.hidden ? "0px" : oldStyle.marginTop;
    const oldMarginBottom = element.hidden ? "0px" : oldStyle.marginBottom;
    const oldOpacity =
      element.hidden || !before.height ? 0 : Number(oldStyle.opacity);
    animations.get(element)?.cancel();
    element.style.overflow = "";
    mutate();
    const hidden = element.hidden;
    const after = element.getBoundingClientRect();
    const nextStyle = getComputedStyle(element);
    const targetTop = hidden ? "0px" : nextStyle.marginTop;
    const targetBottom = hidden ? "0px" : nextStyle.marginBottom;
    if (
      reducedMotion() ||
      !element.animate ||
      (!before.height && !after.height)
    )
      return Promise.resolve();
    element.hidden = false;
    element.style.overflow = "hidden";
    return new Promise((resolve) => {
      const animation = element.animate(
        [
          {
            height: `${before.height}px`,
            marginTop: oldMarginTop,
            marginBottom: oldMarginBottom,
            opacity: oldOpacity,
            transform: oldOpacity ? "translateY(0)" : "translateY(-6px)",
          },
          {
            height: `${after.height}px`,
            marginTop: targetTop,
            marginBottom: targetBottom,
            opacity: hidden || !after.height ? 0 : 1,
            transform: hidden ? "translateY(-6px)" : "translateY(0)",
          },
        ],
        { duration: MOTION_MS, easing: EASE_OUT_BACK },
      );
      animations.set(element, animation);
      activeAnimations.add(animation);
      animation.onfinish = () => {
        element.hidden = hidden;
        element.style.overflow = "";
        animations.delete(element);
        activeAnimations.delete(animation);
        resolve();
      };
      animation.oncancel = () => {
        activeAnimations.delete(animation);
        resolve();
      };
    });
  }
  function setText(element, text) {
    if (element.textContent === text) return Promise.resolve();
    return update(element, () => {
      element.textContent = text;
    });
  }
  const isOpen = (element) =>
    element.open && element.dataset.closing !== "true";
  function setOpen(element, open) {
    if (isOpen(element) === open) return;
    const height = element.getBoundingClientRect().height;
    animations.get(element)?.cancel();
    element.dataset.closing = String(!open);
    element.open = true;
    const target = open
      ? element.scrollHeight
      : element.querySelector("summary").getBoundingClientRect().height;
    element.dispatchEvent(new CustomEvent("detailschange"));
    const finish = () => {
      element.open = open;
      delete element.dataset.closing;
      element.style.overflow = "";
      activeAnimations.delete(animations.get(element));
      animations.delete(element);
    };
    if (reducedMotion() || !element.animate) {
      finish();
      return;
    }
    element.style.overflow = "hidden";
    const animation = element.animate(
      [{ height: `${height}px` }, { height: `${target}px` }],
      { duration: MOTION_MS, easing: EASE_OUT_BACK },
    );
    animations.set(element, animation);
    activeAnimations.add(animation);
    animation.onfinish = finish;
    animation.oncancel = () => activeAnimations.delete(animation);
  }
  root.querySelectorAll("details").forEach((element) => {
    const summary = element.querySelector("summary");
    const toggle = (event) => {
      event.preventDefault();
      setOpen(element, !isOpen(element));
    };
    summary.addEventListener("click", toggle);
    removers.push(() => summary.removeEventListener("click", toggle));
  });
  return {
    setOpen,
    isOpen,
    reducedMotion,
    update,
    setText,
    destroy() {
      removers.forEach((remove) => remove());
      activeAnimations.forEach((animation) => animation.cancel());
      activeAnimations.clear();
    },
  };
}
