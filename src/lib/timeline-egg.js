const CODES = ["0324", "bacolod"];
const DEST = "/timeline/#born";
const STORAGE_KEY = "tl-unlock";

let navigateTo = (href) => {
  location.assign(href);
};
let busy = false;

function typingInField(target) {
  if (!(target instanceof Element)) return false;
  if (target.closest("input, textarea, select, [contenteditable='true'], [cmdk-root], [role='combobox']")) {
    return true;
  }
  return target instanceof HTMLElement && target.isContentEditable;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function onTimeline() {
  return location.pathname.replace(/\/+$/, "") === "/timeline";
}

function originFrom(el) {
  if (!(el instanceof Element)) {
    return { x: 50, y: 46 };
  }
  const box = el.getBoundingClientRect();
  return {
    x: ((box.left + box.width / 2) / Math.max(window.innerWidth, 1)) * 100,
    y: ((box.top + box.height / 2) / Math.max(window.innerHeight, 1)) * 100,
  };
}

function gateRoot() {
  return document.getElementById("tl-gate-root");
}

function markUnlocking(on) {
  document.documentElement.classList.toggle("is-tl-unlocking", on);
  document.documentElement.classList.toggle("is-timeline-egg", on);
  try {
    if (on) sessionStorage.setItem(STORAGE_KEY, "1");
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

function mountGate(origin) {
  const root = gateRoot() ?? document.body;
  root.querySelectorAll(".tl-gate").forEach((node) => node.remove());

  const gate = document.createElement("div");
  gate.className = "tl-gate";
  gate.dataset.phase = "enter";
  gate.setAttribute("aria-hidden", "true");
  gate.style.setProperty("--ox", `${origin.x}%`);
  gate.style.setProperty("--oy", `${origin.y}%`);
  gate.innerHTML = `
    <div class="tl-gate-wash"></div>
    <div class="tl-gate-bloom"></div>
    <div class="tl-gate-sun">${Array.from({ length: 8 }, (_, i) => `<span style="--r:${i * 45}deg"></span>`).join("")}</div>
    <div class="tl-gate-rings"><span></span><span></span><span></span></div>
    <div class="tl-gate-line"></div>
    <div class="tl-gate-stamp">
      <p class="tl-gate-kicker">The first chapter</p>
      <p class="tl-gate-date">03.24</p>
      <p class="tl-gate-place">Bacolod City</p>
    </div>
  `;
  root.append(gate);
  void gate.offsetWidth;
  return gate;
}

function teardownGate() {
  gateRoot()?.querySelectorAll(".tl-gate").forEach((node) => node.remove());
  markUnlocking(false);
}

function announce(message) {
  let live = document.getElementById("tl-gate-live");
  if (!(live instanceof HTMLElement)) {
    live = document.createElement("p");
    live.id = "tl-gate-live";
    live.className = "sr-only";
    live.setAttribute("aria-live", "polite");
    document.body.append(live);
  }
  live.textContent = "";
  window.setTimeout(() => {
    live.textContent = message;
  }, 40);
}

function celebrateBorn() {
  const born = document.getElementById("born");
  if (!(born instanceof HTMLElement)) return;
  born.classList.add("is-found", "is-in", "is-lit");
  born.querySelector("[data-tl-node]")?.classList.add("is-lit");
  born.scrollIntoView({ block: "center", behavior: "instant" });
  window.setTimeout(() => born.classList.remove("is-found"), 1800);
  announce("Timeline unlocked. Born in Bacolod City, March 24, 2004.");
}

async function goToTimeline() {
  if (onTimeline()) {
    if (location.hash !== "#born") location.hash = "born";
    return;
  }
  await navigateTo(DEST);
}

async function playUnlock(originEl) {
  if (busy) return;
  busy = true;
  markUnlocking(true);

  if (prefersReducedMotion()) {
    await goToTimeline();
    celebrateBorn();
    teardownGate();
    busy = false;
    return;
  }

  const origin = originFrom(originEl);
  const gate = mountGate(origin);
  gate.dataset.phase = "enter";
  await wait(260);
  gate.dataset.phase = "mark";
  await wait(780);
  gate.dataset.phase = "hold";
  await wait(420);
  await goToTimeline();
  await wait(80);
  const live = document.querySelector(".tl-gate") ?? mountGate(origin);
  live.dataset.phase = "hold";
  await wait(90);
  live.dataset.phase = "leave";
  await wait(420);
  celebrateBorn();
  await wait(520);
  teardownGate();
  busy = false;
}

async function playArrival() {
  if (busy) return;
  if (!onTimeline()) {
    markUnlocking(false);
    return;
  }
  busy = true;
  markUnlocking(true);
  if (prefersReducedMotion()) {
    celebrateBorn();
    teardownGate();
    busy = false;
    return;
  }
  const existing = document.querySelector(".tl-gate");
  const gate = existing ?? mountGate({ x: 50, y: 46 });
  gate.dataset.phase = "hold";
  await wait(160);
  gate.dataset.phase = "leave";
  await wait(420);
  celebrateBorn();
  await wait(520);
  teardownGate();
  busy = false;
}

function pendingArrival() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function bindTimelineEgg(options = {}) {
  if (typeof options.navigate === "function") {
    navigateTo = options.navigate;
  }
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
        playUnlock();
      }
    },
    true,
  );

  document.addEventListener(
    "click",
    (event) => {
      const sash = event.target instanceof Element ? event.target.closest(".contact-sash") : null;
      if (!sash) return;
      event.preventDefault();
      playUnlock(sash);
    },
    true,
  );

  document.addEventListener("astro:before-swap", (event) => {
    if (!pendingArrival()) return;
    event.newDocument.documentElement.classList.add("is-tl-unlocking", "is-timeline-egg");
  });

  document.addEventListener("astro:page-load", () => {
    if (!pendingArrival() || busy) return;
    playArrival();
  });

  if (pendingArrival() && onTimeline()) {
    playArrival();
  }
}
