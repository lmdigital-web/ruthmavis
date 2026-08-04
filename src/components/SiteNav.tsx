import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png.asset.json";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-gold/25 bg-cream/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
        <Link to="/" className="group flex items-center gap-3 min-w-0" onClick={() => setOpen(false)}>
          <img src={logoAsset.url} alt="Ruth Mavis Accessories" className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="group relative font-sans text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary data-[status=active]:text-primary"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full border border-gold/40 p-2 text-primary md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t border-gold/20 bg-cream/95 backdrop-blur-xl transition-all duration-400 md:hidden",
          open ? "max-h-64" : "max-h-0 border-transparent",
        )}
      >
        <div className="flex flex-col px-6 py-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className="border-b border-gold/15 py-3.5 font-sans text-sm tracking-wide text-foreground/85 last:border-0 data-[status=active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
