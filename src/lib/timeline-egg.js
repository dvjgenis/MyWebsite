const CODES = ["0324", "bacolod"];
const DEST = "/timeline/#born";

function typingInField(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true'], [cmdk-root], [role='combobox']")) {
    return true;
  }
  return target instanceof HTMLElement && target.isContentEditable;
}

function flashThenGo() {
  document.documentElement.classList.add("is-timeline-egg");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.setTimeout(() => {
    document.documentElement.classList.remove("is-timeline-egg");
    if (location.pathname.replace(/\/+$/, "") === "/timeline") {
      location.hash = "born";
      return;
    }
    location.assign(DEST);
  }, reduce ? 0 : 420);
}

export function bindTimelineEgg() {
  if (document.documentElement.dataset.timelineEgg === "true") return;
  document.documentElement.dataset.timelineEgg = "true";

  let buffer = "";
  let idle;

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key.length !== 1) return;
      if (typingInField(event.target)) return;

      buffer = (buffer + event.key.toLowerCase()).slice(-16);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        buffer = "";
      }, 2800);

      if (CODES.some((code) => buffer.endsWith(code))) {
        buffer = "";
        flashThenGo();
      }
    },
    true,
  );
}
