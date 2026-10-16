import { Link } from "@tanstack/react-router";

const links = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/cookies", label: "Cookies Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/accessibility", label: "Accessibility" },
  { to: "/data-request", label: "Your data" },
  { to: "/credits", label: "Credits & Sources" },
  { to: "/donate", label: "☕ Donate" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Hornet Watch Malta</span>
        <nav aria-label="Legal" className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="inline-block py-2 underline-offset-2 hover:underline">{l.label}</Link>
          ))}
          <a href="mailto:info@stefanbuttigieg.com" className="inline-block py-2 underline-offset-2 hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
