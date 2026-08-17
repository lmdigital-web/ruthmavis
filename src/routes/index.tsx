import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, HeartHandshake, Music2, Package, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { BotanicalSprig, Flourish } from "@/components/Flourish";
import { contactDetails } from "@/components/SiteFooter";
import heroFloral from "@/assets/hero-floral.jpg";
import imgBibles from "@/assets/collection-bibles.jpg";
import imgDevotionals from "@/assets/collection-devotionals.jpg";
import imgCrochet from "@/assets/collection-crochet.jpg";
import imgCombos from "@/assets/collection-combos.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruth Mavis Accessories | Faith-Filled Gifts & Bibles" },
      {
        name: "description",
        content:
          "Decorative Bibles, Christian devotionals, handmade crochet bags and curated gift combos — thoughtfully made in South Africa. Shop coming soon.",
      },
      { property: "og:title", content: "Ruth Mavis Accessories | Faith-Filled Gifts & Bibles" },
      {
        property: "og:description",
        content:
          "Decorative Bibles, Christian devotionals, handmade crochet bags and curated gift combos — thoughtfully made in South Africa. Shop coming soon.",
      },
    ],
  }),
  component: HomePage,
});

const collections = [
  {
    title: "Decorative Bibles",
    slug: "decorative-bibles",
    copy: "Gift-worthy Bibles with gilded pages and soft covers.",
    image: imgBibles,
  },
  {
    title: "Devotionals",
    slug: "devotionals",
    copy: "Praying Wife, Boldness, My Creative Bible and more.",
    image: imgDevotionals,
  },
  {
    title: "Crochet Bags",
    slug: "handmade-crochet",
    copy: "Handmade bags, purses and little pouches.",
    image: imgCrochet,
  },
  {
    title: "Gift Combos",
    slug: "gift-combos",
    copy: "Bundled sets ready to wrap and give.",
    image: imgCombos,
  },
];

const features = [
  {
    icon: Gift,
    title: "Thoughtfully Curated Gifts",
    copy: "Every piece is chosen to encourage her heart — never filler, always meaningful.",
  },
  {
    icon: HeartHandshake,
    title: "Handmade with Love",
    copy: "Our crochet bags and pouches are crafted stitch by stitch, in small batches.",
  },
  {
    icon: Package,
    title: "Affordable Combo Bundles",
    copy: "Pair a Bible, a devotional and an accessory into one beautifully priced set.",
  },
];

const verses = [
  {
    text: "She is clothed with strength and dignity, and she laughs without fear of the future.",
    ref: "Proverbs 31:25",
  },
  {
    text: "Every good and perfect gift is from above, coming down from the Father of lights.",
    ref: "James 1:17",
  },
  {
    text: "Let all that you do be done in love.",
    ref: "1 Corinthians 16:14",
  },
];

function HomePage() {
  const [verseIndex, setVerseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setVerseIndex((i) => (i + 1) % verses.length), 7000);
    return () => clearInterval(id);
  }, []);

  const verse = verses[verseIndex] ?? verses[0]!;

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-blush/70 via-cream to-background" />
        <img
          src={heroFloral}
          alt="Dried pink roses and a blush devotional book on cream linen"
          width={1600}
          height={1008}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
        />
        <BotanicalSprig className="float-slow absolute top-28 -left-6 -z-10 h-56 w-44 opacity-70 sm:left-6 md:h-72 md:w-56" />
        <BotanicalSprig className="float-slow absolute -right-8 bottom-10 -z-10 h-52 w-40 rotate-[160deg] opacity-60 md:h-64 md:w-52" />

        <div className="mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-6 pt-32 pb-24 text-center sm:px-8">
          <span className="rise-in font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            Christian Gifting &amp; Accessories · South Africa
          </span>
          <h1 className="rise-in mt-6 text-4xl leading-[1.1] font-normal text-primary [animation-delay:120ms] sm:text-5xl md:text-6xl lg:text-7xl">
            Faith, Beauty &amp; Grace
            <span className="block font-script italic">in Every Gift</span>
          </h1>
          <Flourish className="rise-in mt-7 w-48 [animation-delay:260ms]" />
          <p className="rise-in mt-7 max-w-xl text-base leading-relaxed text-muted-foreground [animation-delay:340ms] sm:text-lg">
            Decorative Bibles, devotionals, handmade crochet bags and curated combo bundles —
            gathered to bless the women you love.
          </p>
          <div className="rise-in mt-10 flex flex-col items-center gap-4 [animation-delay:440ms] sm:flex-row">
            <Link
              to="/shop"
              className="group inline-flex items-center gap-2 rounded-full px-8 py-3.5 font-sans text-sm tracking-wide shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 border border-[#5C1A1A] bg-[#5C1A1A] text-white hover:bg-[#4A1515]"
            >
              <ShoppingBag size={16} className="text-gold" />
              Shop Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured collections */}
      <section className="relative px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Featured Collections"
            title="Gathered with Care"
            subtitle="A little preview of what we love to wrap up — real product photography coming as the shop opens."
          />
          <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {collections.map((item, i) => (
              <Reveal key={item.title} delay={i * 120} as="article">
                <div className="card-lift group h-full overflow-hidden rounded-3xl border border-gold/20 bg-card shadow-[var(--shadow-soft)]">
                  <div className="aspect-4/5 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      width={900}
                      height={1100}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl text-primary">{item.title}</h3>
                    <span className="gold-rule mx-auto mt-3 w-12" />
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.copy}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="relative overflow-hidden bg-blush/35 px-6 py-24 sm:px-8">
        <BotanicalSprig className="absolute -top-6 right-4 h-48 w-36 rotate-12 opacity-50" />
        <div className="relative mx-auto max-w-6xl">
          <SectionHeading eyebrow="Why Choose Us" title="Gifts That Say More" />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 140}>
                <div className="card-lift h-full rounded-3xl border border-gold/20 bg-card/80 p-9 text-center backdrop-blur-sm">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-cream text-primary">
                    <f.icon size={22} />
                  </span>
                  <h3 className="mt-6 text-xl text-primary">{f.title}</h3>
                  <span className="gold-rule mx-auto mt-3 w-10" />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scripture strip */}
      <section className="relative overflow-hidden bg-primary px-6 py-24 text-center sm:px-8">
        <img
          src={heroFloral}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-15 mix-blend-overlay pointer-events-none"
        />
        <BotanicalSprig className="absolute -bottom-8 -left-6 h-56 w-44 text-gold/25 opacity-60" />
        <BotanicalSprig className="absolute -top-10 -right-6 h-56 w-44 rotate-180 text-gold/25 opacity-60" />
        <Reveal className="relative mx-auto max-w-3xl">
          <Flourish className="mx-auto w-40 text-gold-soft" />
          <blockquote key={verseIndex} className="rise-in mt-8">
            <p className="font-script text-2xl leading-relaxed text-cream italic sm:text-3xl md:text-4xl">
              “{verse.text}”
            </p>
            <cite className="mt-6 block font-sans text-xs tracking-[0.3em] text-gold-soft not-italic uppercase">
              {verse.ref}
            </cite>
          </blockquote>
          <div className="mt-10 flex justify-center gap-2.5">
            {verses.map((v, i) => (
              <button
                key={v.ref}
                type="button"
                aria-label={`Show verse ${i + 1}`}
                onClick={() => setVerseIndex(i)}
                className={
                  i === verseIndex
                    ? "h-1.5 w-8 rounded-full bg-gold transition-all"
                    : "h-1.5 w-3 rounded-full bg-cream/35 transition-all"
                }
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* Social proof / TikTok */}
      <section className="px-6 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-4xl rounded-[2rem] border border-gold/25 bg-blush/40 px-8 py-14 text-center shadow-[var(--shadow-soft)]">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-gold-soft">
            <Music2 size={22} />
          </span>
          <h2 className="mt-6 text-3xl text-primary sm:text-4xl">See It All on TikTok</h2>
          <Flourish className="mx-auto mt-4 w-36" />
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Unboxings, combo reveals and behind-the-stitches clips — join the women already gifting
            with us.
          </p>
          <a
            href={contactDetails.tiktok}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-card px-8 py-3.5 font-sans text-sm tracking-wide text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-gold hover:shadow-[var(--shadow-soft)]"
          >
            Follow {contactDetails.tiktokHandle}
          </a>
        </Reveal>
      </section>
    </>
  );
}
