export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Builds a URL that respects Vite's BASE_URL (important for GitHub Pages).
 * Accepts either a page key (e.g. "Dashboard") or a string with query (e.g. "JobDetail?id=123").
 */
export function createPageUrl(page?: string): string {
  const baseRaw = (import.meta as any).env?.BASE_URL ?? "/";
  const base = typeof baseRaw === "string" ? baseRaw : "/";
  const baseNoTrail = base.endsWith("/") ? base.slice(0, -1) : base;

  if (!page) return base;

  let p = String(page);

  // Splash is your landing page -> root
  if (p === "Splash") p = "";

  if (p.startsWith("/")) p = p.slice(1);

  // Build URL (preserve query string)
  const url = (baseNoTrail ? baseNoTrail : "") + "/" + p;
  return url.replace(/\/\/+/g, "/");
}
