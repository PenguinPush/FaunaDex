// Sigma listens for every document mousemove by default. Only track outside the
// graph while dragging, so unrelated page interactions do no graph work.
export function scopeGraphInput(renderer, container) {
  const mouse = renderer.getMouseCaptor();
  let dragging = false;
  document.removeEventListener("mousemove", mouse.handleMove);
  container.addEventListener("mousemove", mouse.handleMove);

  function start() {
    if (!mouse.isMouseDown || dragging) return;
    dragging = true;
    container.removeEventListener("mousemove", mouse.handleMove);
    document.addEventListener("mousemove", mouse.handleMove);
  }
  function stop() {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener("mousemove", mouse.handleMove);
    container.addEventListener("mousemove", mouse.handleMove);
  }
  function blur() {
    mouse.isMouseDown = false;
    mouse.isMoving = false;
    stop();
  }
  container.addEventListener("mousedown", start);
  document.addEventListener("mouseup", stop);
  window.addEventListener("blur", blur);
  return () => {
    container.removeEventListener("mousemove", mouse.handleMove);
    document.removeEventListener("mousemove", mouse.handleMove);
    container.removeEventListener("mousedown", start);
    document.removeEventListener("mouseup", stop);
    window.removeEventListener("blur", blur);
  };
}
