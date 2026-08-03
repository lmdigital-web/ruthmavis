import { cn } from "@/lib/utils";

/** Small gold botanical flourish used beneath headings and as a divider. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 20"
      aria-hidden="true"
      className={cn("h-5 w-40 text-gold", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M2 10h52" />
      <path d="M106 10h52" />
      <path d="M80 3c-6 3-9 5-9 7s3 4 9 7c6-3 9-5 9-7s-3-4-9-7z" />
      <path d="M80 3v14" />
      <path d="M62 10c2-2 4-3 6 0-2 3-4 2-6 0z" />
      <path d="M98 10c-2-2-4-3-6 0 2 3 4 2 6 0z" />
    </svg>
  );
}

/** Large decorative botanical line art for background texture. */
export function BotanicalSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      aria-hidden="true"
      className={cn("text-gold/40", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      <path d="M100 235C100 160 96 90 70 10" />
      <path d="M96 200c-22-4-34-16-38-36 22 2 34 14 38 36z" />
      <path d="M94 170c20-8 30-22 30-42-20 6-30 20-30 42z" />
      <path d="M89 140c-20-6-30-20-30-40 20 6 30 20 30 40z" />
      <path d="M86 108c19-9 27-24 25-44-19 9-27 24-25 44z" />
      <path d="M80 76c-17-8-25-22-24-40 18 8 26 22 24 40z" />
    </svg>
  );
}
