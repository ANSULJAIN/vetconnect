import type { Metadata } from "next";
import { Prose } from "@/components/ui/Prose";
import { SITE } from "@/data/site";

export const metadata: Metadata = { title: "Refund and cancellation policy" };

export default function RefundPage() {
  return (
    <Prose title="Refund and cancellation policy" updated="September 2026">
      <p>
        We want you to get the consultation you paid for. This policy sets out
        when we refund and how long it takes.
      </p>

      <h2>Full refund</h2>
      <ul>
        <li>No veterinarian was able to call you during your booked slot.</li>
        <li>You cancel more than 30 minutes before the start of your slot.</li>
        <li>You were charged more than once for the same booking.</li>
        <li>A technical failure on our side prevented the consultation.</li>
      </ul>

      <h2>No refund</h2>
      <ul>
        <li>The consultation took place as booked.</li>
        <li>
          You were unreachable on the number provided. Our veterinarians attempt
          the call three times before marking a booking as unreachable.
        </li>
        <li>
          You disagree with the clinical advice given. A consultation that
          concludes your pet needs an in-person examination is a completed
          consultation.
        </li>
        <li>You cancel within 30 minutes of the slot starting.</li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Write to <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>{" "}
        or WhatsApp {SITE.whatsapp} within 7 days of the booking, with your
        registered mobile number and the payment ID from your confirmation.
      </p>

      <h2>How long it takes</h2>
      <p>
        We assess requests within 2 working days. Approved refunds are returned
        to the original payment method and typically appear within 5 to 7
        working days, depending on your bank. We do not charge a processing fee
        on refunds.
      </p>
    </Prose>
  );
}
