import { Link } from "@tanstack/react-router";

const links = [
  { to: "/", label: "Map" },
  { to: "/dashboard", label: "Impact" },
  { to: "/about", label: "Guide" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-[1000] bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground" aria-hidden>⬢</span>
          <span className="hidden sm:inline">Dabbur Watch Malta</span>
          <span className="sm:hidden">Dabbur Watch</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 opacity-80 hover:opacity-100"
              activeProps={{ className: "rounded-md px-3 py-2 bg-ink-foreground/10 opacity-100" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/report" className="ml-1 rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground">
            + Report
          </Link>
        </nav>
      </div>
    </header>
  );
}
