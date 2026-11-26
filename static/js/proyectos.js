const projectRows = [...document.querySelectorAll("[data-project-row]")];
const projectTransition = document.querySelector("[data-project-transition]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHoverProjects = window.matchMedia("(hover: hover) and (pointer: fine)");
let lastPointerPosition = null;

function readableInk(hexColor) {
  const hex = hexColor.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(hex)) return "#0c0c0c";
  const channels = [0, 2, 4].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const luminance = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const relativeLuminance = .2126 * luminance[0] + .7152 * luminance[1] + .0722 * luminance[2];
  return relativeLuminance < .179 ? "#f5f5f5" : "#0c0c0c";
}

function previewProject(row) {
  if (!row) return;
  const color = row.dataset.projectColor;
  document.body.style.setProperty("--page-project-color", color);
  const ink = readableInk(color);
  document.body.style.setProperty("--page-project-ink", ink);
  document.body.classList.toggle("project-preview-dark", ink === "#f5f5f5");
  document.body.classList.add("project-preview");
  projectRows.forEach((item) => item.classList.toggle("is-previewed", item === row));
}

function clearProjectPreview() {
  document.body.classList.remove("project-preview");
  document.body.classList.remove("project-preview-dark");
  document.body.style.removeProperty("--page-project-color");
  document.body.style.removeProperty("--page-project-ink");
  projectRows.forEach((item) => item.classList.remove("is-previewed"));
}

projectRows.forEach((row) => {
  if (canHoverProjects.matches) {
    row.addEventListener("pointerenter", () => previewProject(row));
    row.addEventListener("pointerleave", (event) => {
      const nextRow = event.relatedTarget?.closest?.("[data-project-row]");
      if (nextRow && projectRows.includes(nextRow)) return;
      window.requestAnimationFrame(() => {
        const hoveredRow = projectRows.find((item) => item.matches(":hover"));
        if (hoveredRow) previewProject(hoveredRow);
        else if (!projectRows.some((item) => item.contains(document.activeElement))) clearProjectPreview();
      });
    });
  }
  row.addEventListener("focus", () => previewProject(row));
});

const projectList = document.querySelector("[data-project-list]");
document.addEventListener("pointermove", (event) => {
  lastPointerPosition = { x: event.clientX, y: event.clientY };
}, { passive: true });
projectList?.addEventListener("pointerleave", () => {
  if (canHoverProjects.matches && !projectRows.some((row) => row.contains(document.activeElement))) clearProjectPreview();
});
projectList?.addEventListener("focusout", (event) => {
  if (!event.currentTarget.contains(event.relatedTarget) && !projectRows.some((row) => row.matches(":hover"))) clearProjectPreview();
});
window.addEventListener("scroll", () => {
  if (!canHoverProjects.matches || !document.body.classList.contains("project-preview") || !lastPointerPosition) return;
  window.requestAnimationFrame(() => {
    const target = document.elementFromPoint(lastPointerPosition.x, lastPointerPosition.y)?.closest?.("[data-project-row]");
    if (target && projectRows.includes(target)) previewProject(target);
    else if (!projectRows.some((row) => row.contains(document.activeElement))) clearProjectPreview();
  });
}, { passive: true });

projectRows.forEach((row) => {
  row.addEventListener("click", (event) => {
    if (!projectTransition || reduceMotion.matches || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    const bounds = row.getBoundingClientRect();
    projectTransition.style.top = `${bounds.top}px`;
    projectTransition.style.left = `${bounds.left}px`;
    projectTransition.style.width = `${bounds.width}px`;
    projectTransition.style.height = `${bounds.height}px`;
    projectTransition.style.backgroundColor = row.dataset.projectColor;
    document.body.style.setProperty("--page-project-ink", readableInk(row.dataset.projectColor));
    document.body.classList.add("project-transitioning");
    void projectTransition.offsetWidth;
    projectTransition.classList.add("is-active");
    window.setTimeout(() => { window.location.assign(row.href); }, 700);
  });
});
