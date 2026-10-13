import { createFileRoute } from "@tanstack/react-router";
import { Flourish } from "@/components/Flourish";
import { contactDetails } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Ruth Mavis Accessories" },
      {
        name: "description",
        content:
          "Read how Ruth Mavis Accessories collects, uses, protects and retains personal information.",
      },
    ],
  }),
  component: PrivacyPolicyPage,
});

const policySections = [
  {
    title: "What information do we collect?",
    text: "We gather personal particulars including electronic mail address, residential delivery address, mobile telephone number, and additional details, alongside non-personal information such as web browser specifications.",
  },
  {
    title: "How we collect personal information",
    text: "Your data is accumulated through your engagements with our organization, encompassing website navigation, purchase transactions, and direct correspondence.",
  },
  {
    title: "Consent and use of your personal information",
    text: "We utilize your information to deliver services, execute marketing initiatives, address your inquiries, undertake administrative functions, and satisfy our legal and commercial responsibilities, while obtaining your authorization where applicable.",
  },
  {
    title: "Consent to processing",
    text: "When required, we shall procure consent to process your information, particularly regarding marketing communications and when you furnish registration or discretionary information.",
  },
  {
    title: "Security of your personal information",
    text: "RUTH MAVIS ACCESSORIES is devoted to protecting your data from unlawful access or unauthorized disclosure, implementing comprehensive physical, technological, and procedural protective measures.",
  },
  {
    title: "Cookies and similar technologies",
    text: "We employ cookies to optimize your website experience, evaluate site performance, and administer user preferences, maintaining clarity regarding our data collection and utilization practices.",
  },
  {
    title: "Retaining your personal information",
    text: "Your personal data is preserved for the duration necessary to accomplish its designated purposes, meet regulatory requirements, or as authorized by your consent.",
  },
  {
    title: "Accurate and up to date",
    text: "We endeavour to maintain the accuracy and currency of your information, encouraging you to periodically review and revise your personal details.",
  },
  {
    title: "Your rights",
    text: "You possess the authority to access, amend, or remove your personal information, and we furnish mechanisms enabling you to exercise control over your data.",
  },
  {
    title: "Modifications to this Privacy Policy",
    text: "We reserve the right to revise this policy and shall inform you of any modifications via our website or electronic mail. Your ongoing utilization of our services constitutes your acceptance of such modifications.",
  },
];

function PrivacyPolicyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/60 via-cream to-background px-6 py-16 text-center sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            Customer Information
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-normal text-primary sm:text-5xl">
            Privacy <span className="font-script italic">Policy</span>
          </h1>
          <Flourish className="mx-auto mt-6 w-44" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            At Ruth Mavis Accessories we prioritize your privacy and are committed to protecting
            your personal information responsibly.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Welcome to RUTH MAVIS ACCESSORIES Online. RUTH MAVIS operates during office hours.
              Please contact us by telephone Monday to Friday between 9:00 and 17:00 at{" "}
              <a className="text-primary underline underline-offset-4" href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
                {contactDetails.phone}
              </a>{" "}
              or send an electronic message to{" "}
              <a className="text-primary underline underline-offset-4" href={`mailto:${contactDetails.email}`}>
                {contactDetails.email}
              </a>{" "}
              should you have any inquiries or concerns.
            </p>
          </div>
          <div className="space-y-5">
            {policySections.map((section, index) => (
              <section
                key={section.title}
                className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-cream font-sans text-sm text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg text-primary sm:text-xl">{section.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {section.text}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
