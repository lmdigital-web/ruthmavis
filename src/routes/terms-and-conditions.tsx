import { createFileRoute } from "@tanstack/react-router";
import { Flourish } from "@/components/Flourish";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | Ruth Mavis Accessories" },
      {
        name: "description",
        content:
          "Read the terms and conditions for purchases, payments, delivery, returns and privacy at Ruth Mavis Accessories.",
      },
    ],
  }),
  component: TermsAndConditionsPage,
});

const terms = [
  "Account registration or login is required to complete any purchase on the RUTH MAVIS ACCESSORIES website.",
  "Supplier price fluctuations and ongoing promotional activities regularly affect pricing. Please be aware that you will be charged based on the item prices in effect at the moment of your purchase.",
  "Shipping fees may be modified at any time, with or without advance notification, in response to updates implemented by shipping service providers.",
  "Credit card or debit card information must be supplied at the time of purchase; such details are not retained in the system to maintain security standards.",
  "To prevent delivery delays, ensure that you provide the accurate Paxi code or designated Pudo locker location.",
  "Delivery timeframes range from 7-9 days or 3-5 days, depending on your selected shipping provider. Should any delays occur, you will be informed promptly. For delivery-related inquiries, please contact us at 076 213 4488 or via email: rm@ruthmavisaccessories.co.za",
  "An R10 insurance fee has been included to provide coverage for order replacement in the event of loss during transit.",
  "Shipping is available exclusively within South Africa; international orders cannot be processed.",
  "Defective or damaged items may be returned within 3-4 days following delivery.",
  "Refund amounts will not include delivery and shipping charges that were included in the original order.",
  "Your privacy is important to us, and we are dedicated to ensuring that your personal information remains confidential within the Ruth Mavis Brand and is not disclosed to any external parties.",
  "Product availability is limited, and we will make reasonable attempts to inform customers when items are no longer available after an order has been placed. Ruth Mavis shall only be obligated to issue refunds when unable to fulfil orders at the advertised prices.",
  "When utilizing Pay Later or alternative EFT payment methods, please understand that product stock is reserved only after the order is submitted and payment is received in the Ruth Mavis bank account.",
  "RUTH MAVIS ACCESSORIES retains the authority to modify these terms and conditions at its discretion. Any modifications to these terms and conditions shall be published on this website. Upon each access to the site, you shall be subject to the then-current version of these terms and conditions.",
];

function TermsAndConditionsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/60 via-cream to-background px-6 py-16 text-center sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            Customer Information
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-normal text-primary sm:text-5xl">
            Terms <span className="font-script italic">&amp; Conditions</span>
          </h1>
          <Flourish className="mx-auto mt-6 w-44" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Please read the following terms and conditions before placing an order with Ruth Mavis Accessories.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <ol className="space-y-5">
            {terms.map((term, index) => (
              <li
                key={index}
                className="flex gap-4 rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:gap-5 sm:p-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-cream font-sans text-sm text-primary">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {term}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
