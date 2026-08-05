import { createFileRoute, Link } from "@tanstack/react-router";
import { BookHeart, Cross, Sparkles } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { BotanicalSprig, Flourish } from "@/components/Flourish";
import aboutStory from "@/assets/about-story.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story | Ruth Mavis Accessories" },
      {
        name: "description",
        content:
          "Meet the heart behind Ruth Mavis Accessories — a South African faith-based brand curating Bibles, devotionals and handmade gifts that encourage women.",
      },
      { property: "og:title", content: "Our Story — Ruth Mavis Accessories" },
      {
        property: "og:description",
        content:
          "A faith-driven mission, a love for gifting, and a passion for encouraging women through beautiful, meaningful pieces.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Cross,
    title: "Faith-Centered",
    copy: "Scripture sits at the heart of every collection we curate — gifts that point her back to God.",
  },
  {
    icon: BookHeart,
    title: "Handmade Quality",
    copy: "Crochet bags, purses and pouches made in small batches, with care you can feel in the stitch.",
  },
  {
    icon: Sparkles,
    title: "Gifts That Encourage",
    copy: "Every combo is built to lift her spirit — a word, a verse, a beautiful thing to hold.",
  },
];

const timeline = [
  {
    year: "The Beginning",
    copy: "A love for gifting and a growing collection of beautiful Bibles turned into something worth sharing.",
  },
  {
    year: "First Combos",
    copy: "Friends began asking for sets — a Bible, a devotional, a little handmade pouch, wrapped as one.",
  },
  {
    year: "Crochet & Craft",
    copy: "Handmade bags and purses joined the range, adding warmth and personality to every bundle.",
  },
  {
    year: "What's Next",
    copy: "An online shop with combo bundle pricing, so gifting grace becomes even simpler.",
  },
];

function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-blush/60 via-cream to-background px-6 pt-12 pb-20 text-center sm:px-8">
        <BotanicalSprig className="float-slow absolute top-24 -left-8 h-56 w-44 opacity-60 md:left-10" />
        <BotanicalSprig className="float-slow absolute -right-8 bottom-0 h-52 w-40 rotate-[165deg] opacity-50 md:right-10" />
        <div className="relative mx-auto max-w-3xl">
          <span className="rise-in font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            About Us
          </span>
          <h1 className="rise-in mt-6 text-4xl leading-tight text-primary [animation-delay:120ms] sm:text-5xl md:text-6xl">
            Our <span className="font-script italic">Story</span>
          </h1>
          <Flourish className="rise-in mx-auto mt-6 w-44 [animation-delay:240ms]" />
          <p className="rise-in mx-auto mt-7 max-w-xl text-base leading-relaxed text-muted-foreground [animation-delay:320ms]">
            Ruth Mavis Accessories began with a simple belief: a gift can carry a whole message of
            hope.
          </p>
        </div>
      </section>

      {/* Founder story */}
      <section className="px-6 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-gold/20 shadow-[var(--shadow-soft)]">
              <img
                src={aboutStory}
                alt="An open Bible with a journal, tea and dried pink roses in warm morning light"
                loading="lazy"
                width={1200}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={140}>
            <SectionHeading
              align="left"
              eyebrow="The Heart Behind It"
              title="Gifting as a Ministry"
            />
            <div className="mt-7 space-y-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <p>
                What started as a personal love for beautiful Bibles and encouraging devotionals grew
                into a small South African business with a big heart for women. Every order we wrap is
                a small act of ministry — a reminder that she is seen, prayed for and deeply loved.
              </p>
              <p>
                We search out pieces that feel special in the hand: gilded page edges, soft covers,
                devotionals like <em>Praying Wife</em>, <em>Boldness</em> and{" "}
                <em>My Creative Bible</em>, and crochet bags made slowly and intentionally.
              </p>
              <p>
                Our mission is simple — to make faith-filled gifting easy, affordable and beautiful,
                so you can be the encouragement someone needs today.
              </p>
            </div>
            <Link
              to="/contact"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-sans text-sm tracking-wide text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90"
            >
              Say Hello
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="relative overflow-hidden bg-blush/35 px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHeading eyebrow="Mission & Values" title="What We Hold On To" />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 140}>
                <div className="card-lift h-full rounded-3xl border border-gold/20 bg-card/80 p-9 text-center backdrop-blur-sm">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-cream text-primary">
                    <v.icon size={22} />
                  </span>
                  <h3 className="mt-6 text-xl text-primary">{v.title}</h3>
                  <span className="gold-rule mx-auto mt-3 w-10" />
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{v.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="How It Started" title="A Gentle Beginning" />
          <ol className="relative mt-16 space-y-10 border-l border-gold/30 pl-8">
            {timeline.map((step, i) => (
              <Reveal key={step.year} as="li" delay={i * 120} className="relative">
                <span className="absolute top-1.5 -left-[2.28rem] h-3 w-3 rounded-full border border-gold bg-cream" />
                <h3 className="text-xl text-primary">{step.year}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {step.copy}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
