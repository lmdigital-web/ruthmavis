import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Music2, Phone } from "lucide-react";
import { Flourish } from "./Flourish";
import logoAsset from "@/assets/logo.png.asset.json";

export const contactDetails = {
  email: "hello@ruthmavisaccessories.co.za",
  phone: "+27 71 234 5678",
  tiktok: "https://www.tiktok.com/@ruthmavisaccessories",
  tiktokHandle: "@ruthmavisaccessories",
  location: "Nelspruit, Mpumalanga, 1201",
};

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-gold/25 bg-blush/40">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="" className="h-12 w-12 object-contain" />
            <div>
              <p className="text-2xl text-primary">Ruth Mavis</p>
              <p className="font-sans text-[0.62rem] tracking-[0.34em] text-gold uppercase">
                Accessories
              </p>
            </div>
          </div>
          <Flourish className="mt-4 -ml-1 w-32" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Faith-filled gifts, decorative Bibles, devotionals and handmade crochet pieces —
            thoughtfully curated for the women you love.
          </p>
        </div>

        <div>
          <h3 className="font-sans text-xs tracking-[0.28em] text-primary uppercase">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              { to: "/", label: "Home" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact Us" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="text-muted-foreground/70">Shop — coming soon</li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-xs tracking-[0.28em] text-primary uppercase">Get in touch</h3>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <Mail size={15} className="shrink-0 text-gold" />
              <a href={`mailto:${contactDetails.email}`} className="hover:text-primary">
                {contactDetails.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={15} className="shrink-0 text-gold" />
              <a href={`tel:${contactDetails.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                {contactDetails.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Music2 size={15} className="shrink-0 text-gold" />
              <a
                href={contactDetails.tiktok}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {contactDetails.tiktokHandle}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin size={15} className="shrink-0 text-gold" />
              {contactDetails.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold/20 px-6 py-6">
        <p className="mx-auto max-w-6xl text-center font-sans text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ruth Mavis Accessories. Made with faith &amp; love in South
          Africa.
        </p>
      </div>
    </footer>
  );
}
