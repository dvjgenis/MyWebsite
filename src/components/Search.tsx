import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Command } from "cmdk";
import { allRoutes } from "../data/navigation";

export default function Search() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const groups = useMemo(() => {
    const map = new Map<string, typeof allRoutes>();
    for (const route of allRoutes) {
      const key = route.section ?? "Pages";
      const list = map.get(key) ?? [];
      list.push(route);
      map.set(key, list);
    }
    return [...map.entries()];
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    lastTrigger.current?.focus();
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => {
          if (o) lastTrigger.current?.focus();
          else lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          return !o;
        });
      }
      if (e.key === "Escape") close();
    },
    [close],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    const openHandler = () => {
      lastTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setOpen(true);
    };
    window.addEventListener("open-search", openHandler);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-search", openHandler);
    };
  }, [onKeyDown]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onPop = () => setOpen(false);
    window.addEventListener("popstate", onPop);

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const nodes = [...root.querySelectorAll<HTMLElement>("input, button, [cmdk-item], [role='option']")].filter(
        (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1,
      );
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", trap);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        aria-label="Close search"
        onClick={close}
      />
      <div ref={panelRef} className="relative w-full max-w-lg">
      <Command className="relative w-full rounded-2xl border border-border bg-paper shadow-2xl overflow-hidden" label="Search pages">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <svg className="w-4 h-4 text-ink-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Command.Input
            placeholder="Search pages…"
            className="w-full px-1 py-4 text-base bg-transparent outline-none text-ink placeholder:text-ink-muted/70"
            autoFocus
          />
          <kbd className="hidden sm:inline font-sans text-[0.65rem] uppercase tracking-wide text-ink-muted border border-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-sm text-ink-muted">
            No matching pages. Try a name like “Granada” or “Education”.
          </Command.Empty>
          {groups.map(([heading, routes]) => (
            <Command.Group
              key={heading}
              heading={heading}
              className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-ink-muted"
            >
              {routes.map((route) => (
                <Command.Item
                  key={route.href}
                  value={`${route.title} ${route.section ?? ""} ${route.href}`}
                  onSelect={() => {
                    window.location.href = route.href;
                  }}
                  className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm text-ink aria-selected:bg-accent/15 data-[selected=true]:bg-accent/15 transition-colors"
                >
                  <span className="min-w-0 truncate">{route.title}</span>
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
      </div>
    </div>
  );
}
