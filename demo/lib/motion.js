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

export function createPageMotion(root, { layoutElements = () => [] } = {}) {
  const removers = [];
  const activeAnimations = new Set();
  const animations = new WeakMap();
  const layoutAnimations = new WeakMap();
  let changingLayout = false;
  let pendingReveals = [];

  function layout(mutate) {
    // A mode switch can close another dropdown and hide the preview. Measure
    // that whole synchronous operation together, not each nested change.
    if (changingLayout) return mutate();
    const elements = [...new Set(layoutElements())].filter(Boolean);
    const reduced = reducedMotion();
    const measure = () =>
      elements.map((element) => element.getBoundingClientRect());
    // Capture the current visual position before cancelling an interrupted FLIP.
    const before = reduced ? [] : measure();
    elements.forEach((element) => layoutAnimations.get(element)?.cancel());
    changingLayout = true;
    let result;
    try {
      result = mutate();
    } finally {
      changingLayout = false;
      const after = reduced ? [] : measure();
      elements.forEach((element, index) => {
        const first = before[index],
          last = after[index];
        if (!first?.height || !last?.height || !element.animate) return;
        const x = first.left - last.left,
          y = first.top - last.top;
        if (Math.abs(x) < 0.5 && Math.abs(y) < 0.5) return;
        // Individual translate composes with hover transforms and the content
        // reveal. No height, margin, or per-frame measurements are involved.
        const animation = element.animate(
          [{ translate: `${x}px ${y}px` }, { translate: "0px 0px" }],
          { duration: MOTION_MS, easing: EASE_OUT_BACK },
        );
        layoutAnimations.set(element, animation);
        activeAnimations.add(animation);
        animation.onfinish = animation.oncancel = () => {
          if (layoutAnimations.get(element) === animation)
            layoutAnimations.delete(element);
          activeAnimations.delete(animation);
        };
      });
      const reveals = pendingReveals;
      pendingReveals = [];
      reveals.forEach((reveal) => reveal());
    }
    return result;
  }
  function cancel(element) {
    animations.get(element)?.cancel();
  }
  function reveal(element, clip = false, bounce = false) {
    if (changingLayout)
      return new Promise((resolve) => {
        pendingReveals.push(() => resolve(reveal(element, clip, bounce)));
      });
    cancel(element);
    if (reducedMotion() || !element.animate) return Promise.resolve();
    return new Promise((resolve) => {
      const animation = element.animate(
        [
          {
            ...(bounce ? {} : { opacity: 0 }),
            transform:
              clip || bounce ? "translateY(-18px)" : "translateY(-6px)",
            ...(clip ? { clipPath: "inset(0 0 100% 0)" } : {}),
          },
          {
            ...(bounce ? {} : { opacity: 1 }),
            transform: "translateY(0)",
            ...(clip ? { clipPath: "inset(0 0 0% 0)" } : {}),
          },
        ],
        { duration: MOTION_MS, easing: EASE_OUT_BACK },
      );
      animations.set(element, animation);
      activeAnimations.add(animation);
      const finish = () => {
        if (animations.get(element) === animation) animations.delete(element);
        activeAnimations.delete(animation);
        resolve();
      };
      animation.onfinish = animation.oncancel = finish;
    });
  }
  function update(element, mutate, { clip = false, bounce = false } = {}) {
    // Commit layout once. Only opacity/transform change during the animation;
    // hiding takes effect immediately, including keyboard/accessibility state.
    return layout(() => {
      cancel(element);
      mutate();
      return element.hidden ? Promise.resolve() : reveal(element, clip, bounce);
    });
  }
  function setText(element, text) {
    if (element.textContent === text) return Promise.resolve();
    return update(element, () => {
      element.textContent = text;
    });
  }
  const isOpen = (element) => element.open;
  function setOpen(element, open) {
    if (isOpen(element) === open) return;
    return layout(() => {
      const content = [...element.children].filter(
        (child) => child.tagName !== "SUMMARY",
      );
      content.forEach(cancel);
      element.open = open;
      element.dispatchEvent(new CustomEvent("detailschange"));
      // Reveal from the top with an overshooting translation for the bounce.
      // The clip changes visual coverage, never the content's layout dimensions.
      if (element.open) content.forEach((child) => reveal(child, true));
    });
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
    layout,
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
