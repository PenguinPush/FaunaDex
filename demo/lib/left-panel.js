import { createPageMotion } from "./motion";

export function createLeftPanel(root, { onSearch, onStatus }) {
  const $ = (id) => root.querySelector(`#${id}`);
  const motion = createPageMotion(root);
  let previewUrl,
    selectedDemo = null,
    disposed = false;

  function updateInputMode() {
    $("search-button-label").textContent = motion.isOpen($("text-option"))
      ? "Find matches"
      : "Identify animal";
  }
  function showPreview() {
    return motion.update($("preview"), () => {
      $("preview").hidden =
        motion.isOpen($("text-option")) ||
        !(selectedDemo || $("image").files[0]);
    });
  }
  function textChanged() {
    if (motion.isOpen($("text-option")))
      motion.setOpen($("upload-option"), false);
    showPreview();
    updateInputMode();
  }
  function uploadChanged() {
    if (motion.isOpen($("upload-option")))
      motion.setOpen($("text-option"), false);
    updateInputMode();
  }
  $("text-option").addEventListener("detailschange", textChanged);
  $("upload-option").addEventListener("detailschange", uploadChanged);

  function useImageInput() {
    motion.setOpen($("text-option"), false);
    updateInputMode();
  }
  function clearDemoSelection() {
    selectedDemo = null;
    root
      .querySelectorAll(".demo-image")
      .forEach((button) => button.setAttribute("aria-pressed", "false"));
  }
  function selectDemo(button) {
    useImageInput();
    motion.setOpen($("upload-option"), false);
    clearDemoSelection();
    selectedDemo = button.dataset.image;
    button.setAttribute("aria-pressed", "true");
    $("image").value = "";
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    $("preview").src = selectedDemo;
    $("preview").alt = button.dataset.name + " demo photo";
    if ($("preview").complete) showPreview();
    onStatus("Photo selected. Choose Identify animal.");
  }
  function upload() {
    useImageInput();
    clearDemoSelection();
    $("preview").alt = "Selected animal photo";
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }
    const file = $("image").files[0];
    if (!file)
      motion.update($("preview"), () => {
        $("preview").hidden = true;
      });
    else {
      previewUrl = URL.createObjectURL(file);
      $("preview").src = previewUrl;
      onStatus("Photo selected. Choose Identify animal.");
    }
  }
  async function submit(event) {
    event.preventDefault();
    if ($("search-button").disabled) return;
    const mode = motion.isOpen($("text-option")) ? "text" : "image";
    const file = $("image").files[0];
    if (mode === "image") {
      if (!file && !selectedDemo)
        return onStatus("Upload or select a photo first.", true);
      if (file && file.size > 10 * 1024 * 1024)
        return onStatus("Choose an image smaller than 10 MB.", true);
    } else if (!$("description").value.trim())
      return onStatus("Enter a description first.", true);
    const body = new FormData();
    if (mode === "text") body.append("text", $("description").value);
    else if (selectedDemo) body.append("demo", selectedDemo.split("/").pop());
    else body.append("image", file);
    $("search-button").disabled = true;
    try {
      await onSearch(body, mode);
    } finally {
      if (!disposed) $("search-button").disabled = false;
    }
  }
  return {
    selectDemo,
    upload,
    showPreview,
    submit,
    example() {
      $("description").value = $("description").placeholder;
      $("description").focus();
    },
    destroy() {
      disposed = true;
      $("text-option").removeEventListener("detailschange", textChanged);
      $("upload-option").removeEventListener("detailschange", uploadChanged);
      motion.destroy();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
  };
}
