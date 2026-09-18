const surpriseSkip = new Set(["/", "/about/", "/initiatives/"]);

export function surpriseHref(routes, current) {
  const here = current === "/" || current.endsWith("/") ? current : `${current}/`;
  const allowed = routes.filter((href) => href && !surpriseSkip.has(href));
  const pool = allowed.filter((href) => href !== here);
  const list = pool.length ? pool : allowed;
  return list[Math.floor(Math.random() * list.length)] ?? "/about/background/";
}

export function bindSurprise() {
  document.querySelectorAll("[data-surprise]").forEach((node) => {
    if (!(node instanceof HTMLAnchorElement) || node.dataset.surpriseBound === "true") return;
    let routes = [];
    try {
      routes = JSON.parse(node.dataset.surpriseRoutes || "[]");
    } catch {
      routes = [];
    }
    if (!routes.length) return;
    node.dataset.surpriseBound = "true";
    const roll = () => {
      node.href = surpriseHref(routes, location.pathname);
    };
    roll();
    node.addEventListener("pointerenter", roll);
    node.addEventListener("focus", roll);
    node.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      location.assign(surpriseHref(routes, location.pathname));
    });
  });
}
