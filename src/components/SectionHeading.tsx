import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { Flourish } from "./Flourish";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
  inverted?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
  inverted = false,
}: Props) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "font-sans text-[0.7rem] tracking-[0.32em] uppercase",
            inverted ? "text-gold-soft" : "text-gold",
          )}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "text-3xl leading-tight font-normal sm:text-4xl md:text-5xl",
          inverted ? "text-cream" : "text-primary",
        )}
      >
        {title}
      </h2>
      <Flourish className={cn(align === "left" && "-ml-1")} />
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed",
            inverted ? "text-cream/80" : "text-muted-foreground",
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}
