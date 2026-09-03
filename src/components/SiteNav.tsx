import { Link } from "@tanstack/react-router";
import { Menu, X, User as UserIcon, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { CartDrawer } from "./CartDrawer";

const links = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

const WOOCOMMERCE_ACCOUNT_URL =
  "https://shop.ruthmavisaccessories.co.za/my-account/";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();
  const cartTotalItems = totalItems();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleAccountClick = () => {
    setOpen(false);
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-gold/25 bg-cream/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <img
              src="/logo.png"
              alt="Ruth Mavis Accessories"
              className={cn(
                "h-auto object-contain transition-all duration-500 group-hover:scale-105",
                scrolled ? "w-16" : "w-32 sm:w-40",
              )}
            />
          </Link>

          <div className="hidden items-center gap-9 md:flex">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.to === "/" }}
                className="group relative font-sans text-sm font-semibold tracking-wide text-burgundy transition-colors hover:text-burgundy/70 data-[status=active]:text-burgundy"
              >
                {link.label}

                <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100 group-data-[status=active]:scale-x-100" />
              </Link>
            ))}

            <div className="ml-2 h-4 w-px bg-gold/30" />

            <button
              onClick={() => setCartOpen(true)}
              className="group relative flex items-center gap-2 rounded-full border border-burgundy/30 bg-burgundy/5 px-3 py-1.5 text-burgundy transition-all hover:bg-burgundy/10"
              aria-label="Open shopping bag"
            >
              <ShoppingBag size={18} className="text-burgundy" />

              {cartTotalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-burgundy text-[10px] font-bold text-white shadow-sm ring-1 ring-white">
                  {cartTotalItems}
                </span>
              )}
            </button>

            <a
              href={WOOCOMMERCE_ACCOUNT_URL}
              onClick={handleAccountClick}
              className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-sm tracking-wide text-primary transition-all hover:bg-gold/15 active:scale-95"
            >
              <UserIcon size={16} className="text-gold" />
              Login
            </a>
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

            <a
              href={WOOCOMMERCE_ACCOUNT_URL}
              onClick={handleAccountClick}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-burgundy py-3 font-sans text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <UserIcon size={16} />
              Login / My Account
            </a>
          </div>
        </div>

        <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      </header>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        aria-label={`Open shopping bag${
          cartTotalItems > 0
            ? `, ${cartTotalItems} item${cartTotalItems === 1 ? "" : "s"}`
            : ""
        }`}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-white shadow-lg ring-2 ring-white/80 transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 sm:bottom-6 sm:right-6"
      >
        <ShoppingBag size={22} strokeWidth={1.8} />

        {cartTotalItems > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-burgundy shadow-sm ring-2 ring-white">
            {cartTotalItems}
          </span>
        )}
      </button>
    </>
  );
}