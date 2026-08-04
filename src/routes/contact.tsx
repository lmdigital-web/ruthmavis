import { createFileRoute } from "@tanstack/react-router";
import { Check, Mail, MapPin, Music2, Phone } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import { BotanicalSprig, Flourish } from "@/components/Flourish";
import { contactDetails } from "@/components/SiteFooter";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Ruth Mavis Accessories" },
      {
        name: "description",
        content:
          "Get in touch with Ruth Mavis Accessories for gift combos, Bibles, devotionals and handmade crochet pieces. Based in South Africa.",
      },
      { property: "og:title", content: "Contact Ruth Mavis Accessories" },
      {
        property: "og:description",
        content: "Questions about a gift combo or custom bundle? Send us a message — we'd love to help.",
      },
    ],
  }),
  component: ContactPage,
});

const details = [
  { icon: Mail, label: "Email", value: contactDetails.email, href: `mailto:${contactDetails.email}` },
  {
    icon: Phone,
    label: "Phone / WhatsApp",
    value: contactDetails.phone,
    href: `tel:${contactDetails.phone.replace(/\s/g, "")}`,
  },
  {
    icon: Music2,
    label: "TikTok",
    value: contactDetails.tiktokHandle,
    href: contactDetails.tiktok,
  },
  { icon: MapPin, label: "Location", value: "Nelspruit, Mpumalanga, 1201" },
];

const inputClass =
  "w-full rounded-2xl border border-gold/25 bg-blush/25 px-5 py-3.5 font-sans text-sm text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 outline-none focus:border-gold focus:bg-card focus:shadow-[0_0_0_4px_oklch(0.78_0.088_82/0.22)]";

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-blush/60 via-cream to-background px-6 pt-36 pb-16 text-center sm:px-8">
        <BotanicalSprig className="float-slow absolute top-24 -left-8 h-52 w-40 opacity-55 md:left-10" />
        <BotanicalSprig className="float-slow absolute -right-8 bottom-0 h-48 w-36 rotate-[168deg] opacity-45 md:right-10" />
        <div className="relative mx-auto max-w-2xl">
          <span className="rise-in font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            Contact Us
          </span>
          <h1 className="rise-in mt-6 text-4xl leading-tight text-primary [animation-delay:120ms] sm:text-5xl">
            Let's <span className="font-script italic">Talk Gifting</span>
          </h1>
          <Flourish className="rise-in mx-auto mt-6 w-44 [animation-delay:240ms]" />
          <p className="rise-in mt-6 text-base leading-relaxed text-muted-foreground [animation-delay:320ms]">
            Planning a gift for someone special, or curious about a custom combo? Send us a note and
            we'll reply with love.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Form */}
          <Reveal>
            <div className="rounded-[2rem] border border-gold/20 bg-card p-8 shadow-[var(--shadow-soft)] sm:p-10">
              {sent ? (
                <div className="rise-in flex flex-col items-center py-12 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-blush/50 text-primary">
                    <Check size={26} />
                  </span>
                  <h2 className="mt-6 text-2xl text-primary sm:text-3xl">Thank You</h2>
                  <Flourish className="mx-auto mt-4 w-36" />
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Your message is on its way. We'll be in touch soon — until then, may your day be
                    full of grace.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-8 rounded-full border border-primary/25 px-7 py-3 font-sans text-sm text-primary transition-colors hover:border-gold"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-6">
                  <h2 className="text-2xl text-primary">Send a Message</h2>
                  <span className="gold-rule w-16" />
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="font-sans text-xs tracking-[0.2em] text-primary uppercase"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="font-sans text-xs tracking-[0.2em] text-primary uppercase"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="font-sans text-xs tracking-[0.2em] text-primary uppercase"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us who you're gifting for…"
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary px-8 py-3.5 font-sans text-sm tracking-wide text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </Reveal>

          {/* Details + location */}
          <div className="space-y-8">
            <Reveal delay={140}>
              <div className="rounded-[2rem] border border-gold/20 bg-blush/35 p-8">
                <h2 className="text-2xl text-primary">Contact Details</h2>
                <span className="gold-rule mt-3 w-16" />
                <ul className="mt-7 space-y-6">
                  {details.map((d) => (
                    <li key={d.label} className="flex min-w-0 items-start gap-4">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-cream text-primary">
                        <d.icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans text-[0.65rem] tracking-[0.22em] text-gold uppercase">
                          {d.label}
                        </p>
                        {d.href ? (
                          <a
                            href={d.href}
                            target={d.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="block truncate text-sm text-foreground/85 transition-colors hover:text-primary"
                          >
                            {d.value}
                          </a>
                        ) : (
                          <p className="text-sm text-foreground/85">{d.value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-[2rem] border border-gold/20 bg-gradient-to-br from-cream to-blush/60">
                <BotanicalSprig className="absolute -bottom-6 -left-4 h-40 w-32 opacity-50" />
                <BotanicalSprig className="absolute -top-6 -right-4 h-40 w-32 rotate-180 opacity-40" />
                <div className="relative text-center">
                  <MapPin className="mx-auto text-gold" size={26} />
                  <p className="mt-3 text-xl text-primary">South Africa</p>
                  <p className="mt-1 font-sans text-xs tracking-[0.24em] text-muted-foreground uppercase">
                    Nationwide gifting
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
