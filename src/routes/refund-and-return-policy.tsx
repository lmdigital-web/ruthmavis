import { createFileRoute } from "@tanstack/react-router";
import { Flourish } from "@/components/Flourish";
import { contactDetails } from "@/components/SiteFooter";

export const Route = createFileRoute("/refund-and-return-policy")({
  head: () => ({
    meta: [
      { title: "Refund and Return Policy | Ruth Mavis Accessories" },
      {
        name: "description",
        content:
          "Review Ruth Mavis Accessories' refund, return, delivery, order cancellation, processing and tracking information.",
      },
    ],
  }),
  component: RefundAndReturnPolicyPage,
});

function RefundAndReturnPolicyPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-blush/60 via-cream to-background px-6 py-16 text-center sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <span className="font-sans text-[0.68rem] tracking-[0.36em] text-gold uppercase">
            Customer Information
          </span>
          <h1 className="mt-5 text-4xl leading-tight font-normal text-primary sm:text-5xl">
            Refund <span className="font-script italic">&amp; Return Policy</span>
          </h1>
          <Flourish className="mx-auto mt-6 w-44" />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Information about returns, delivery options, order cancellations, processing and tracking.
          </p>
        </div>
      </section>

      <section className="px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="text-2xl text-primary sm:text-3xl">Refund and Return Policy</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Our primary objective is to ensure complete customer satisfaction. Should you find yourself dissatisfied with your purchase, you are entitled to return or exchange your order within three to four days following delivery.
            </p>

            <h3 className="mt-7 text-lg text-primary sm:text-xl">How to Return an Item</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>
                Please submit an email to{" "}
                <a className="text-primary underline underline-offset-4" href={`mailto:${contactDetails.email}`}>
                  {contactDetails.email}
                </a>.
              </li>
              <li>Include your order number and the reason for your return.</li>
              <li>
                Contact details are required, or alternatively you may reach us at{" "}
                <a className="text-primary underline underline-offset-4" href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
                  {contactDetails.phone}
                </a>.
              </li>
            </ol>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Please note that all expenses incurred throughout this process shall be covered by the purchaser or the individual initiating the return.
            </p>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="text-2xl text-primary sm:text-3xl">Delivery Information</h2>
            <h3 className="mt-5 text-lg text-primary sm:text-xl">Delivery Options</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Paxi shipping — available through PEP store locations.</li>
              <li>Pudo locker — self-service pickup point.</li>
            </ul>

            <h3 className="mt-6 text-lg text-primary sm:text-xl">Delivery Cost</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Paxi, 7–9 days — R70.</li>
              <li>Paxi, 3–5 days — R120.</li>
              <li>Paxi, 3–5 days, bulk buying — R150.</li>
              <li>Pudo locker — R80.</li>
            </ul>

            <h3 className="mt-6 text-lg text-primary sm:text-xl">Please Note</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>
                An additional R10 insurance fee has been incorporated into the Paxi shipping cost to ensure that your order may be replaced in the event it is lost during the shipping process.
              </li>
              <li>We only ship within South Africa; international orders are not allowed.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="text-2xl text-primary sm:text-3xl">Order Cancellation</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Contact us directly at{" "}
              <a className="text-primary underline underline-offset-4" href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}>
                {contactDetails.phone}
              </a>{" "}
              or by sending an email to{" "}
              <a className="text-primary underline underline-offset-4" href={`mailto:${contactDetails.email}`}>
                {contactDetails.email}
              </a>.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Customer service hours are 9am–5pm, Monday–Thursday.
            </p>
          </section>

          <section className="rounded-2xl border border-gold/20 bg-card/80 p-5 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="text-2xl text-primary sm:text-3xl">Order Processing and Tracking</h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Order processing requires a duration of two to three business days.</li>
              <li>Notification regarding shipment status will be transmitted upon the dispatch of your order.</li>
              <li>
                Your order's status may be monitored or tracked through the Paxi portal if Paxi was used for shipping, or alternatively through Courier Guy should the order have been dispatched via Pudo.
              </li>
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
